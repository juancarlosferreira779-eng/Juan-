'use strict';

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'chat.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'Disponible',
    color TEXT DEFAULT '#6d5dfc',
    is_admin INTEGER NOT NULL DEFAULT 0,
    is_banned INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_seen INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('direct','group','community')),
    name TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chat_members (
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at INTEGER NOT NULL,
    PRIMARY KEY (chat_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    kind TEXT NOT NULL DEFAULT 'text',
    text TEXT DEFAULT '',
    file_url TEXT DEFAULT '',
    file_name TEXT DEFAULT '',
    file_mime TEXT DEFAULT '',
    file_size INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    reply_to TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    edited_at INTEGER DEFAULT 0,
    deleted INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_messages_chat_time ON messages(chat_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS message_reactions (
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    PRIMARY KEY (message_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS chat_reads (
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_read_at INTEGER NOT NULL,
    PRIMARY KEY (chat_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL DEFAULT 'text',
    text TEXT DEFAULT '',
    file_url TEXT DEFAULT '',
    file_mime TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_stories_expiry ON stories(expires_at);

  CREATE TABLE IF NOT EXISTS story_views (
    story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (story_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'message',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    chat_id TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    read INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS calls (
    id TEXT PRIMARY KEY,
    caller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    callee_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    chat_id TEXT DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'voice',
    status TEXT NOT NULL DEFAULT 'ringing',
    created_at INTEGER NOT NULL,
    ended_at INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    cc TEXT DEFAULT '',
    bcc TEXT DEFAULT '',
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    attachments TEXT NOT NULL DEFAULT '[]',
    folder TEXT NOT NULL DEFAULT 'inbox',
    star INTEGER NOT NULL DEFAULT 0,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_emails_owner_folder ON emails(owner_id, folder, created_at DESC);

  CREATE TABLE IF NOT EXISTS mail_contacts (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, email)
  );
`);

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function avatarDataUrl(name, color) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -35)}"/></linearGradient></defs><rect width="128" height="128" rx="64" fill="url(#g)"/><text x="64" y="77" font-family="Arial,sans-serif" font-size="46" font-weight="700" fill="white" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function shade(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const now = () => Date.now();
const uid = () => crypto.randomUUID();

function seedDemo() {
  if (process.env.SEED_DEMO === '0') return;
  const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (count > 0) return;

  const demoUsers = [
    { id: 'demo-ana', name: 'Ana Torres', email: 'ana@demo.com', description: 'Diseñadora de producto. Café, diseño y buenas conversaciones ☕', color: '#7c5cff', status: 'Disponible', admin: 0 },
    { id: 'demo-luis', name: 'Luis Ramírez', email: 'luis@demo.com', description: 'Desarrollador full stack. Siempre aprendiendo algo nuevo.', color: '#00a884', status: 'En el gimnasio', admin: 0 },
    { id: 'demo-marta', name: 'Marta Sosa', email: 'marta@demo.com', description: 'Marketing y comunidad. Amo los gatos 🐈', color: '#f0647b', status: 'Disponible', admin: 0 },
    { id: 'demo-admin', name: 'Sofía (Admin)', email: 'admin@demo.com', description: 'Administradora de Nexo Chat', color: '#e58a2c', status: 'Disponible', admin: 1 },
  ];
  const insertUser = db.prepare(`INSERT INTO users (id,name,email,password_hash,avatar,description,status,color,is_admin,created_at,last_seen) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  for (const u of demoUsers) {
    insertUser.run(u.id, u.name, u.email, hashPassword('123456'), avatarDataUrl(u.name, u.color), u.description, u.status, u.color, u.admin, now() - 86400000 * 12, now());
  }

  const t = now();
  const insertChat = db.prepare('INSERT INTO chats (id,type,name,avatar,description,created_by,created_at) VALUES (?,?,?,?,?,?,?)');
  const insertMember = db.prepare('INSERT INTO chat_members (chat_id,user_id,role,joined_at) VALUES (?,?,?,?)');
  insertChat.run('demo-chat-ana', 'direct', '', '', '', 'demo-ana', t - 86400000 * 3);
  insertMember.run('demo-chat-ana', 'demo-ana', 'member', t - 86400000 * 3);
  insertMember.run('demo-chat-ana', 'demo-luis', 'member', t - 86400000 * 3);
  insertChat.run('demo-chat-group', 'group', 'Equipo de producto', '', 'Planificación, diseño y lanzamientos', 'demo-ana', t - 86400000 * 8);
  for (const id of ['demo-ana', 'demo-luis', 'demo-marta']) insertMember.run('demo-chat-group', id, id === 'demo-ana' ? 'admin' : 'member', t - 86400000 * 8);
  insertChat.run('demo-chat-marta', 'direct', '', '', '', 'demo-marta', t - 86400000 * 2);
  insertMember.run('demo-chat-marta', 'demo-marta', 'member', t - 86400000 * 2);
  insertMember.run('demo-chat-marta', 'demo-luis', 'member', t - 86400000 * 2);

  const insertMessage = db.prepare(`INSERT INTO messages (id,chat_id,sender_id,kind,text,created_at) VALUES (?,?,?,?,?,?)`);
  const seedMessages = [
    ['demo-chat-ana', 'demo-ana', 'text', '¡Hola Luis! ¿Ya viste el nuevo prototipo?', t - 7200000],
    ['demo-chat-ana', 'demo-luis', 'text', 'Sí, se ve genial. Me encanta la animación del menú 👌', t - 7000000],
    ['demo-chat-ana', 'demo-ana', 'text', 'Perfecto, entonces lo subo al repositorio esta tarde.', t - 6800000],
    ['demo-chat-ana', 'demo-luis', 'text', '¡Listo! Avísame si necesitas ayuda con el backend.', t - 3600000],
    ['demo-chat-group', 'demo-ana', 'text', 'Buenos días equipo ☀️ Hoy revisamos los avances del sprint.', t - 86400000 + 3600000],
    ['demo-chat-group', 'demo-marta', 'text', 'Ya dejé el borrador del anuncio en el documento.', t - 86400000 + 7200000],
    ['demo-chat-group', 'demo-luis', 'text', 'Genial, yo termino la API de notificaciones hoy.', t - 3600000 * 5],
    ['demo-chat-group', 'demo-marta', 'text', '¿Alguien puede revisar los colores del modo oscuro?', t - 3600000 * 2],
    ['demo-chat-marta', 'demo-marta', 'text', 'Hola 👋 ¿Cómo va el proyecto?', t - 86400000],
    ['demo-chat-marta', 'demo-luis', 'text', 'Muy bien, casi terminamos. Te cuento pronto.', t - 86400000 + 1800000],
  ];
  seedMessages.forEach((m, i) => insertMessage.run(`seed-msg-${i}`, ...m));
  db.prepare('INSERT INTO message_reactions (message_id,user_id,emoji) VALUES (?,?,?)').run('seed-msg-1', 'demo-ana', '❤️');

  const insertEmail = db.prepare(`INSERT INTO emails
    (id,owner_id,sender_id,from_email,to_email,cc,bcc,subject,body,attachments,folder,star,is_read,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  insertEmail.run('seed-mail-1', 'demo-ana', 'demo-luis', 'luis@demo.com', 'ana@demo.com', '', '',
    'Reunión de mañana', 'Hola Ana:\n\n¿Podemos revisar el prototipo a primera hora? Traigo el backend listo.\n\nSaludos,\nLuis', '[]', 'inbox', 0, 0, t - 3600000);
  insertEmail.run('seed-mail-2', 'demo-ana', 'demo-marta', 'marta@demo.com', 'ana@demo.com', '', '',
    'Ideas para el grupo', '¡Hola! Dejé algunas ideas para el próximo lanzamiento en el documento compartido. ¿Lo revisamos?', '[]', 'inbox', 1, 1, t - 86400000);
  insertEmail.run('seed-mail-3', 'demo-ana', 'demo-ana', 'ana@demo.com', 'luis@demo.com', '', '',
    'Prototipo listo', 'Ya subí la última versión del prototipo. ¡Gracias por tu ayuda!', '[]', 'sent', 0, 1, t - 7200000);
  insertEmail.run('seed-mail-4', 'demo-ana', 'demo-ana', 'ana@demo.com', '', '', '',
    'Borrador de propuesta', 'Propuesta para el equipo:\n\n1. ...\n2. ...', '[]', 'drafts', 0, 1, t - 172800000);
  insertEmail.run('seed-mail-5', 'demo-luis', 'demo-ana', 'ana@demo.com', 'luis@demo.com', '', '',
    'Gracias por el prototipo', 'Se ve excelente. Lo reviso esta tarde.', '[]', 'inbox', 0, 1, t - 5400000);
  db.prepare('INSERT INTO mail_contacts (user_id,email,name,created_at) VALUES (?,?,?,?)').run('demo-ana', 'luis@demo.com', 'Luis Ramírez', t - 86400000);
  db.prepare('INSERT INTO mail_contacts (user_id,email,name,created_at) VALUES (?,?,?,?)').run('demo-ana', 'marta@demo.com', 'Marta Sosa', t - 86400000);

  const insertStory = db.prepare('INSERT INTO stories (id,user_id,kind,text,file_url,file_mime,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?)');
  insertStory.run('seed-story-1', 'demo-marta', 'text', '¡Nuevo día, nuevas ideas! ✨', '', '', t - 3600000, t + 23 * 3600000);
  insertStory.run('seed-story-2', 'demo-luis', 'text', 'Compilando… ☕💻', '', '', t - 7200000, t + 22 * 3600000);
}

seedDemo();

module.exports = { db, DATA_DIR, UPLOAD_DIR, hashPassword, verifyPassword, avatarDataUrl, now, uid };
