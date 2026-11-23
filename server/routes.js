'use strict';

const express = require('express');
const multer = require('multer');
const { db, hashPassword, verifyPassword, avatarDataUrl, now, uid } = require('./db');
const { createSession, destroySession, requireAuth, requireAdmin, publicUser } = require('./auth');
const {
  isMember, listChats, listMessages, serializeChat, serializeMessage, serializeStory,
  markRead, notify, saveUpload, allowedFile, emitToUser, emitChatUpdated, previewText,
} = require('./helpers');
const ai = require('./ai');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (allowedFile(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido'));
  },
});

const mailUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (allowedFile(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido en el correo'));
  },
});

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const ioOf = (req) => req.app.get('io');
const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));

/* --------------------------- Mail helpers ----------------------------- */
function parseRecipients(value) {
  return [...new Set(String(value || '').split(/[,;]/).map((x) => x.trim().toLowerCase()).filter(emailOk))];
}

function serializeEmail(row, viewerId) {
  const sender = row.sender_id ? db.prepare('SELECT id,name,email,avatar,color FROM users WHERE id = ?').get(row.sender_id) : null;
  let attachments = [];
  try { attachments = JSON.parse(row.attachments || '[]'); } catch { attachments = []; }
  return {
    id: row.id,
    fromEmail: row.from_email,
    fromName: sender?.name || row.from_email.split('@')[0] || 'Desconocido',
    fromAvatar: sender?.avatar || '',
    fromColor: sender?.color || '#7c5cff',
    to: row.to_email,
    cc: row.cc || '',
    bcc: row.bcc || '',
    subject: row.subject,
    body: row.body,
    attachments,
    folder: row.folder,
    star: Boolean(row.star),
    read: Boolean(row.is_read),
    createdAt: row.created_at,
    mine: row.sender_id === viewerId,
  };
}

function unreadMail(userId) {
  return db.prepare("SELECT COUNT(*) AS n FROM emails WHERE owner_id = ? AND folder = 'inbox' AND is_read = 0").get(userId).n;
}

function mailAttachments(files = []) {
  return files.map((file) => {
    const saved = saveUpload(file);
    return { name: saved.name, url: saved.url, size: saved.size, mime: saved.mime };
  });
}

function deliverEmail(req, payload, attachments, recipients) {
  const io = ioOf(req);
  const created = [];
  for (const email of recipients) {
    const recipient = db.prepare('SELECT id FROM users WHERE email = ? AND is_banned = 0').get(email);
    if (!recipient || recipient.id === req.user.id) continue;
    const id = uid();
    db.prepare(`INSERT INTO emails
      (id,owner_id,sender_id,from_email,to_email,cc,bcc,subject,body,attachments,folder,star,is_read,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, recipient.id, req.user.id, req.user.email, email, payload.cc, '', payload.subject, payload.body,
        JSON.stringify(attachments), 'inbox', 0, 0, now());
    const row = db.prepare('SELECT * FROM emails WHERE id = ?').get(id);
    const item = serializeEmail(row, recipient.id);
    created.push(item);
    notify(recipient.id, { type: 'mail', title: `Nuevo correo de ${req.user.name}`, body: payload.subject, chatId: '' });
    emitToUser(io, recipient.id, 'mail:new', { email: item, unread: unreadMail(recipient.id) });
  }
  return created;
}

/* ------------------------------- AUTH ---------------------------------- */

router.post('/auth/register', wrap((req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (name.length < 2) return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
  if (!emailOk(email)) return res.status(400).json({ error: 'Correo electrónico inválido' });
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email))
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });

  const id = uid();
  const color = ['#7c5cff', '#00a884', '#f0647b', '#e58a2c', '#2f80ed', '#eb5757'][Math.floor(Math.random() * 6)];
  db.prepare(`INSERT INTO users (id,name,email,password_hash,avatar,description,status,color,created_at,last_seen)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    id, name, email, hashPassword(password), avatarDataUrl(name, color),
    String(req.body.description || '').trim().slice(0, 300), 'Disponible', color, now(), now(),
  );
  createSession(res, id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.status(201).json({ user: publicUser(user) });
}));

router.post('/auth/login', wrap((req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !verifyPassword(password, user.password_hash))
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  if (user.is_banned) return res.status(403).json({ error: 'Esta cuenta ha sido suspendida' });
  db.prepare('UPDATE users SET last_seen = ? WHERE id = ?').run(now(), user.id);
  createSession(res, user.id);
  res.json({ user: publicUser(user) });
}));

router.post('/auth/logout', wrap((req, res) => {
  destroySession(req, res);
  res.json({ ok: true });
}));

router.get('/me', requireAuth, wrap((req, res) => {
  res.json({
    user: publicUser(req.user),
    onlineCount: require('./helpers').onlineUsers.size,
    unreadMail: unreadMail(req.user.id),
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
  });
}));

/* ------------------------------ PROFILE -------------------------------- */

router.put('/me', requireAuth, wrap((req, res) => {
  const name = String(req.body.name ?? req.user.name).trim();
  const description = String(req.body.description ?? req.user.description).trim().slice(0, 300);
  const status = String(req.body.status ?? req.user.status).trim().slice(0, 80);
  const color = /^#[0-9a-f]{6}$/i.test(req.body.color || '') ? req.body.color : req.user.color;
  if (name.length < 2) return res.status(400).json({ error: 'El nombre es demasiado corto' });
  db.prepare('UPDATE users SET name = ?, description = ?, status = ?, color = ? WHERE id = ?')
    .run(name, description, status, color, req.user.id);
  if (name !== req.user.name && !req.user.avatar.includes('data:image/svg')) {
    // Keep the uploaded photo; initials are generated only for default avatars.
  }
  res.json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)) });
}));

router.post('/me/avatar', requireAuth, upload.single('avatar'), wrap((req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Selecciona una imagen' });
  if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'Debe ser una imagen' });
  const file = saveUpload(req.file);
  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(file.url, req.user.id);
  ioOf(req).emit('profile:updated', { userId: req.user.id, avatar: file.url, name: req.user.name, color: req.user.color });
  res.json({ avatar: file.url });
}));

router.post('/me/password', requireAuth, wrap((req, res) => {
  const current = String(req.body.current || '');
  const next = String(req.body.next || '');
  if (!verifyPassword(current, req.user.password_hash)) return res.status(400).json({ error: 'Contraseña actual incorrecta' });
  if (next.length < 6) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(next), req.user.id);
  res.json({ ok: true });
}));

/* ------------------------------- USERS --------------------------------- */

router.get('/users', requireAuth, wrap((req, res) => {
  const search = String(req.query.search || '').trim().toLowerCase();
  const { onlineUsers } = require('./helpers');
  const rows = db.prepare('SELECT * FROM users WHERE id != ? AND is_banned = 0 ORDER BY name').all(req.user.id);
  const users = rows
    .filter((u) => !search || u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))
    .slice(0, 50)
    .map((u) => {
      const safe = publicUser(u);
      safe.online = onlineUsers.has(u.id);
      return safe;
    });
  res.json({ users });
}));

/* ------------------------------- CHATS --------------------------------- */

router.get('/chats', requireAuth, wrap((req, res) => {
  res.json({ chats: listChats(req.user.id) });
}));

router.post('/chats', requireAuth, wrap((req, res) => {
  const type = ['direct', 'group', 'community'].includes(req.body.type) ? req.body.type : 'direct';
  let memberIds = Array.isArray(req.body.memberIds) ? req.body.memberIds.filter((id) => id && id !== req.user.id) : [];

  if (type === 'direct') {
    if (!memberIds[0]) return res.status(400).json({ error: 'Selecciona una persona' });
    const existing = db.prepare(`
      SELECT c.id FROM chats c
      JOIN chat_members a ON a.chat_id = c.id AND a.user_id = ?
      JOIN chat_members b ON b.chat_id = c.id AND b.user_id = ?
      WHERE c.type = 'direct' LIMIT 1
    `).get(req.user.id, memberIds[0]);
    if (existing) return res.json({ chat: serializeChat(db.prepare('SELECT * FROM chats WHERE id = ?').get(existing.id), req.user.id), existing: true });
    memberIds = memberIds.slice(0, 1);
  } else {
    memberIds = memberIds.slice(0, 60);
    if (!String(req.body.name || '').trim()) return res.status(400).json({ error: 'Ponle un nombre al grupo' });
  }

  for (const id of memberIds) {
    if (!db.prepare('SELECT 1 FROM users WHERE id = ? AND is_banned = 0').get(id))
      return res.status(400).json({ error: 'Uno de los usuarios no está disponible' });
  }

  const id = uid();
  const t = now();
  db.prepare('INSERT INTO chats (id,type,name,avatar,description,created_by,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, type, type === 'direct' ? '' : String(req.body.name).trim().slice(0, 80), '', String(req.body.description || '').slice(0, 300), req.user.id, t);
  const add = db.prepare('INSERT INTO chat_members (chat_id,user_id,role,joined_at) VALUES (?,?,?,?)');
  add.run(id, req.user.id, type === 'direct' ? 'member' : 'admin', t);
  for (const memberId of memberIds) add.run(id, memberId, 'member', t);

  const io = ioOf(req);
  const chat = serializeChat(db.prepare('SELECT * FROM chats WHERE id = ?').get(id), req.user.id);
  for (const memberId of memberIds) {
    emitToUser(io, memberId, 'chat:new', serializeChat(db.prepare('SELECT * FROM chats WHERE id = ?').get(id), memberId));
    if (type !== 'direct') notify(memberId, { type: 'group', title: 'Te agregaron a un grupo', body: `Ahora eres parte de ${chat.name}`, chatId: id });
  }
  res.status(201).json({ chat, existing: false });
}));

router.get('/chats/:id', requireAuth, wrap((req, res) => {
  if (!isMember(req.params.id, req.user.id)) return res.status(403).json({ error: 'No tienes acceso a este chat' });
  const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(req.params.id);
  res.json({ chat: serializeChat(chat, req.user.id) });
}));

router.get('/chats/:id/messages', requireAuth, wrap((req, res) => {
  if (!isMember(req.params.id, req.user.id)) return res.status(403).json({ error: 'No tienes acceso a este chat' });
  const limit = Math.min(Number(req.query.limit) || 60, 150);
  const before = Number(req.query.before) || 0;
  const messages = listMessages(req.params.id, req.user.id, limit, before);
  markRead(req.params.id, req.user.id);
  emitChatUpdated(ioOf(req), req.params.id);
  res.json({ messages, hasMore: messages.length === limit });
}));

router.post('/chats/:id/messages', requireAuth, upload.single('file'), wrap((req, res) => {
  const chatId = req.params.id;
  if (!isMember(chatId, req.user.id)) return res.status(403).json({ error: 'No tienes acceso a este chat' });

  let kind = String(req.body.kind || 'text');
  let text = String(req.body.text || '').trim().slice(0, 4000);
  let fileUrl = '', fileName = '', fileMime = '', fileSize = 0, duration = Number(req.body.duration) || 0;
  let savedFile = null;
  if (req.file) {
    savedFile = saveUpload(req.file);
    fileUrl = savedFile.url; fileName = savedFile.name; fileMime = savedFile.mime; fileSize = savedFile.size;
    kind = req.file.mimetype.startsWith('image/') ? 'image'
      : req.file.mimetype.startsWith('video/') ? 'video'
        : req.file.mimetype.startsWith('audio/') ? 'audio' : 'file';
    if (req.body.kind === 'audio') kind = 'audio';
  }
  if (kind === 'gif') {
    if (!/^https:\/\//i.test(text)) return res.status(400).json({ error: 'URL de GIF inválida' });
    fileUrl = text; text = '';
  }
  if (kind === 'sticker') text = text.slice(0, 16);
  if (!text && !fileUrl && !savedFile) return res.status(400).json({ error: 'Escribe un mensaje o adjunta un archivo' });

  const replyTo = String(req.body.replyTo || '');
  const id = uid();
  const createdAt = now();
  db.prepare(`INSERT INTO messages (id,chat_id,sender_id,kind,text,file_url,file_name,file_mime,file_size,duration,reply_to,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, chatId, req.user.id, kind, text, fileUrl, fileName, fileMime, fileSize, duration, replyTo, createdAt);
  markRead(chatId, req.user.id);

  const message = serializeMessage(db.prepare('SELECT * FROM messages WHERE id = ?').get(id), req.user.id);
  const io = ioOf(req);
  io.to(`chat:${chatId}`).emit('message:new', { chatId, message });
  emitChatUpdated(io, chatId);

  const members = db.prepare('SELECT user_id FROM chat_members WHERE chat_id = ? AND user_id != ?').all(chatId, req.user.id);
  const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(chatId);
  const title = chat.type === 'direct' ? req.user.name : chat.name;
  for (const m of members) {
    notify(m.user_id, {
      type: kind === 'audio' ? 'audio' : 'message',
      title,
      body: kind === 'text' ? (text || 'Nuevo mensaje') : previewText(message),
      chatId,
    });
  }
  res.status(201).json({ message });
}));

router.patch('/messages/:id', requireAuth, wrap((req, res) => {
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado' });
  if (msg.sender_id !== req.user.id) return res.status(403).json({ error: 'Solo puedes editar tus mensajes' });
  const text = String(req.body.text || '').trim().slice(0, 4000);
  if (!text) return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
  db.prepare('UPDATE messages SET text = ?, edited_at = ? WHERE id = ?').run(text, now(), msg.id);
  const io = ioOf(req);
  const updated = serializeMessage(db.prepare('SELECT * FROM messages WHERE id = ?').get(msg.id), req.user.id);
  io.to(`chat:${msg.chat_id}`).emit('message:updated', { chatId: msg.chat_id, message: updated });
  emitChatUpdated(io, msg.chat_id);
  res.json({ message: updated });
}));

router.delete('/messages/:id', requireAuth, wrap((req, res) => {
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado' });
  const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(msg.chat_id);
  const isChatAdmin = db.prepare("SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ? AND role = 'admin'").get(msg.chat_id, req.user.id);
  if (msg.sender_id !== req.user.id && !(chat?.type !== 'direct' && isChatAdmin))
    return res.status(403).json({ error: 'No puedes eliminar este mensaje' });
  db.prepare('UPDATE messages SET deleted = 1, text = ?, file_url = ?, file_name = ?, file_mime = ? WHERE id = ?')
    .run('', '', '', '', '', msg.id);
  const io = ioOf(req);
  io.to(`chat:${msg.chat_id}`).emit('message:deleted', { chatId: msg.chat_id, messageId: msg.id });
  emitChatUpdated(io, msg.chat_id);
  res.json({ ok: true });
}));

router.post('/messages/:id/react', requireAuth, wrap((req, res) => {
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado' });
  if (!isMember(msg.chat_id, req.user.id)) return res.status(403).json({ error: 'Sin acceso' });
  const emoji = String(req.body.emoji || '').slice(0, 8);
  if (!emoji) return res.status(400).json({ error: 'Emoji inválido' });
  const existing = db.prepare('SELECT 1 FROM message_reactions WHERE message_id = ? AND user_id = ?').get(msg.id, req.user.id);
  if (existing) db.prepare('DELETE FROM message_reactions WHERE message_id = ? AND user_id = ?').run(msg.id, req.user.id);
  else db.prepare('INSERT INTO message_reactions (message_id,user_id,emoji) VALUES (?,?,?)').run(msg.id, req.user.id, emoji);
  const reactions = db.prepare('SELECT user_id,emoji FROM message_reactions WHERE message_id = ?').all(msg.id);
  ioOf(req).to(`chat:${msg.chat_id}`).emit('message:reaction', { chatId: msg.chat_id, messageId: msg.id, reactions });
  res.json({ reactions });
}));

router.post('/chats/:id/read', requireAuth, wrap((req, res) => {
  if (!isMember(req.params.id, req.user.id)) return res.status(403).json({ error: 'Sin acceso' });
  markRead(req.params.id, req.user.id);
  emitChatUpdated(ioOf(req), req.params.id);
  res.json({ ok: true });
}));

/* ------------------------------- SEARCH -------------------------------- */

router.get('/search', requireAuth, wrap((req, res) => {
  const q = String(req.query.q || '').trim();
  const chatId = String(req.query.chatId || '');
  if (q.length < 2) return res.json({ messages: [], users: [] });
  const like = `%${q.replace(/[%_]/g, '\\$&')}%`;
  const params = [req.user.id, like];
  let sql = `SELECT m.* FROM messages m
    JOIN chat_members cm ON cm.chat_id = m.chat_id AND cm.user_id = ?
    WHERE m.deleted = 0 AND m.text LIKE ? ESCAPE '\\'`;
  if (chatId) { sql += ' AND m.chat_id = ?'; params.push(chatId); }
  sql += ' ORDER BY m.created_at DESC LIMIT 80';
  const messages = db.prepare(sql).all(...params).map((m) => serializeMessage(m, req.user.id));
  const users = db.prepare('SELECT * FROM users WHERE id != ? AND is_banned = 0 AND (name LIKE ? OR email LIKE ?) LIMIT 20')
    .all(req.user.id, like, like).map(publicUser);
  res.json({ messages, users });
}));

/* ------------------------------- STORIES ------------------------------- */

router.post('/stories', requireAuth, upload.single('file'), wrap((req, res) => {
  const kind = ['text', 'image', 'video'].includes(req.body.kind) ? req.body.kind : 'text';
  let text = String(req.body.text || '').trim().slice(0, 500);
  let fileUrl = '', fileMime = '';
  if (req.file) {
    if (!req.file.mimetype.startsWith('image/') && !req.file.mimetype.startsWith('video/'))
      return res.status(400).json({ error: 'La historia debe ser imagen o video' });
    const saved = saveUpload(req.file);
    fileUrl = saved.url; fileMime = saved.mime;
  }
  if (!text && !fileUrl) return res.status(400).json({ error: 'Agrega texto o una imagen' });
  const id = uid();
  const t = now();
  db.prepare('INSERT INTO stories (id,user_id,kind,text,file_url,file_mime,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, req.user.id, kind, text, fileUrl, fileMime, t, t + 24 * 3600000);
  const story = serializeStory(db.prepare('SELECT * FROM stories WHERE id = ?').get(id), req.user.id);
  ioOf(req).emit('story:new', { story });
  res.status(201).json({ story });
}));

router.get('/stories', requireAuth, wrap((req, res) => {
  const rows = db.prepare('SELECT * FROM stories WHERE expires_at > ? ORDER BY created_at ASC').all(now());
  db.prepare('DELETE FROM stories WHERE expires_at <= ?').run(now());
  res.json({ stories: rows.map((s) => serializeStory(s, req.user.id)) });
}));

router.post('/stories/:id/view', requireAuth, wrap((req, res) => {
  db.prepare('INSERT OR IGNORE INTO story_views (story_id,user_id) VALUES (?,?)').run(req.params.id, req.user.id);
  res.json({ ok: true });
}));

router.delete('/stories/:id', requireAuth, wrap((req, res) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
  if (!story) return res.status(404).json({ error: 'Estado no encontrado' });
  if (story.user_id !== req.user.id) return res.status(403).json({ error: 'No puedes eliminar este estado' });
  db.prepare('DELETE FROM stories WHERE id = ?').run(story.id);
  ioOf(req).emit('story:deleted', { storyId: story.id });
  res.json({ ok: true });
}));

/* ---------------------------- NOTIFICATIONS ---------------------------- */

router.get('/notifications', requireAuth, wrap((req, res) => {
  const rows = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 60').all(req.user.id);
  res.json({ notifications: rows.map((n) => ({ ...n, read: Boolean(n.read) })) });
}));

router.post('/notifications/read', requireAuth, wrap((req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
}));

/* --------------------------------- AI ---------------------------------- */

router.post('/ai', requireAuth, wrap(async (req, res) => {
  const message = String(req.body.message || '').trim().slice(0, 2000);
  if (!message) return res.status(400).json({ error: 'Escribe algo para la IA' });
  const history = Array.isArray(req.body.history) ? req.body.history.slice(-12) : [];
  const result = await ai.reply({ message, history, user: req.user });
  res.json(result);
}));

/* ------------------------------- ADMIN --------------------------------- */

router.get('/admin/overview', requireAuth, requireAdmin, wrap((req, res) => {
  const count = (table) => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n;
  const perDay = db.prepare(`SELECT date(created_at/1000,'unixepoch') AS day, COUNT(*) AS n FROM messages GROUP BY day ORDER BY day DESC LIMIT 7`).all();
  res.json({
    stats: {
      users: count('users'), chats: count('chats'), messages: count('messages'),
      stories: count('stories'), calls: count('calls'), banned: db.prepare('SELECT COUNT(*) AS n FROM users WHERE is_banned = 1').get().n,
    },
    perDay,
    recentUsers: db.prepare('SELECT id,name,email,created_at,is_admin,is_banned FROM users ORDER BY created_at DESC LIMIT 8').all(),
    recentMessages: db.prepare(`SELECT m.id,m.text,m.kind,m.created_at,u.name AS author,c.name AS chat_name
      FROM messages m LEFT JOIN users u ON u.id = m.sender_id LEFT JOIN chats c ON c.id = m.chat_id
      ORDER BY m.created_at DESC LIMIT 8`).all(),
  });
}));

router.get('/admin/users', requireAuth, requireAdmin, wrap((req, res) => {
  const search = String(req.query.search || '').toLowerCase();
  const rows = db.prepare('SELECT id,name,email,avatar,color,is_admin,is_banned,created_at,last_seen FROM users ORDER BY created_at DESC').all();
  res.json({ users: rows.filter((u) => !search || u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)) });
}));

router.post('/admin/users/:id/ban', requireAuth, requireAdmin, wrap((req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'No puedes suspenderte a ti mismo' });
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });
  const banned = target.is_banned ? 0 : 1;
  db.prepare('UPDATE users SET is_banned = ? WHERE id = ?').run(banned, target.id);
  if (banned) {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(target.id);
    emitToUser(ioOf(req), target.id, 'force:logout', { reason: 'Tu cuenta ha sido suspendida por un administrador' });
  }
  res.json({ ok: true, isBanned: Boolean(banned) });
}));

router.post('/admin/users/:id/admin', requireAuth, requireAdmin, wrap((req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });
  const admin = target.is_admin ? 0 : 1;
  db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(admin, target.id);
  emitToUser(ioOf(req), target.id, 'profile:updated', { userId: target.id, isAdmin: Boolean(admin) });
  res.json({ ok: true, isAdmin: Boolean(admin) });
}));

router.delete('/admin/users/:id', requireAuth, requireAdmin, wrap((req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'No puedes eliminar tu cuenta desde aquí' });
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Usuario no encontrado' });
  emitToUser(ioOf(req), target.id, 'force:logout', { reason: 'Tu cuenta ha sido eliminada' });
  db.prepare('DELETE FROM users WHERE id = ?').run(target.id);
  res.json({ ok: true });
}));

router.delete('/admin/messages/:id', requireAuth, requireAdmin, wrap((req, res) => {
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado' });
  db.prepare('UPDATE messages SET deleted = 1, text = ?, file_url = ? WHERE id = ?').run('', '', msg.id);
  ioOf(req).to(`chat:${msg.chat_id}`).emit('message:deleted', { chatId: msg.chat_id, messageId: msg.id });
  emitChatUpdated(ioOf(req), msg.chat_id);
  res.json({ ok: true });
}));

router.post('/admin/broadcast', requireAuth, requireAdmin, wrap((req, res) => {
  const title = String(req.body.title || 'Aviso de Nexo').trim().slice(0, 80);
  const body = String(req.body.body || '').trim().slice(0, 500);
  if (!body) return res.status(400).json({ error: 'Escribe el aviso' });
  const users = db.prepare('SELECT id FROM users').all();
  for (const u of users) notify(u.id, { type: 'broadcast', title, body });
  res.json({ ok: true, sent: users.length });
}));

/* -------------------------------- MAIL -------------------------------- */

router.get('/mail', requireAuth, wrap((req, res) => {
  const allowed = ['inbox', 'sent', 'drafts', 'starred', 'trash'];
  const folder = allowed.includes(req.query.folder) ? req.query.folder : 'inbox';
  const q = String(req.query.q || '').trim().toLowerCase();
  const params = [req.user.id];
  let sql = 'SELECT * FROM emails WHERE owner_id = ?';
  if (folder === 'starred') sql += " AND star = 1 AND folder != 'trash'";
  else { sql += ' AND folder = ?'; params.push(folder); }
  if (q) {
    const like = `%${q.replace(/[%_]/g, '\\$&')}%`;
    sql += " AND (subject LIKE ? OR body LIKE ? OR to_email LIKE ? OR from_email LIKE ?)";
    params.push(like, like, like, like);
  }
  sql += ' ORDER BY created_at DESC LIMIT 200';
  const rows = db.prepare(sql).all(...params);
  const raw = db.prepare(`SELECT
      SUM(CASE WHEN folder = 'inbox' THEN 1 ELSE 0 END) AS inbox,
      SUM(CASE WHEN folder = 'sent' THEN 1 ELSE 0 END) AS sent,
      SUM(CASE WHEN folder = 'drafts' THEN 1 ELSE 0 END) AS drafts,
      SUM(CASE WHEN folder = 'trash' THEN 1 ELSE 0 END) AS trash,
      SUM(CASE WHEN star = 1 AND folder != 'trash' THEN 1 ELSE 0 END) AS starred,
      SUM(CASE WHEN folder = 'inbox' AND is_read = 0 THEN 1 ELSE 0 END) AS unread
    FROM emails WHERE owner_id = ?`).get(req.user.id);
  const counts = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Number(v || 0)]));
  const contacts = db.prepare('SELECT email,name FROM mail_contacts WHERE user_id = ? ORDER BY email').all(req.user.id);
  res.json({ emails: rows.map((r) => serializeEmail(r, req.user.id)), counts, contacts });
}));

router.get('/mail/contacts', requireAuth, wrap((req, res) => {
  res.json({ contacts: db.prepare('SELECT email,name FROM mail_contacts WHERE user_id = ? ORDER BY email').all(req.user.id) });
}));

router.post('/mail/contacts', requireAuth, wrap((req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!emailOk(email)) return res.status(400).json({ error: 'Correo no válido' });
  const name = String(req.body.name || '').trim().slice(0, 80);
  db.prepare('INSERT OR IGNORE INTO mail_contacts (user_id,email,name,created_at) VALUES (?,?,?,?)')
    .run(req.user.id, email, name, now());
  res.status(201).json({ contacts: db.prepare('SELECT email,name FROM mail_contacts WHERE user_id = ? ORDER BY email').all(req.user.id) });
}));

router.delete('/mail/contacts/:email', requireAuth, wrap((req, res) => {
  db.prepare('DELETE FROM mail_contacts WHERE user_id = ? AND email = ?').run(req.user.id, decodeURIComponent(req.params.email).toLowerCase());
  res.json({ ok: true });
}));

router.get('/mail/:id', requireAuth, wrap((req, res) => {
  const row = db.prepare('SELECT * FROM emails WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Correo no encontrado' });
  if (row.folder === 'inbox' && !row.is_read) {
    db.prepare('UPDATE emails SET is_read = 1 WHERE id = ?').run(row.id);
    emitToUser(ioOf(req), req.user.id, 'mail:updated', { unread: unreadMail(req.user.id) });
  }
  res.json({ email: serializeEmail(db.prepare('SELECT * FROM emails WHERE id = ?').get(row.id), req.user.id), unread: unreadMail(req.user.id) });
}));

router.post('/mail', requireAuth, mailUpload.array('files', 10), wrap((req, res) => {
  const action = req.body.action === 'draft' ? 'draft' : 'send';
  const payload = {
    to: String(req.body.to || '').trim(),
    cc: String(req.body.cc || '').trim(),
    bcc: String(req.body.bcc || '').trim(),
    subject: String(req.body.subject || '').trim().slice(0, 200),
    body: String(req.body.body || '').trim().slice(0, 20000),
  };
  const recipients = parseRecipients(`${payload.to},${payload.cc},${payload.bcc}`);
  if (action === 'send' && (!recipients.length || !payload.subject || !payload.body))
    return res.status(400).json({ error: 'Completa destinatario, asunto y mensaje' });
  if (action === 'draft' && !payload.to && !payload.subject && !payload.body && !(req.files || []).length)
    return res.status(400).json({ error: 'El borrador está vacío' });

  const attachments = mailAttachments(req.files);
  const id = uid();
  db.prepare(`INSERT INTO emails
    (id,owner_id,sender_id,from_email,to_email,cc,bcc,subject,body,attachments,folder,star,is_read,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, req.user.id, req.user.id, req.user.email, payload.to, payload.cc, payload.bcc,
      payload.subject, payload.body, JSON.stringify(attachments), action === 'send' ? 'sent' : 'drafts',
      0, action === 'send' ? 1 : 0, now());
  const delivered = action === 'send' ? deliverEmail(req, payload, attachments, recipients) : [];
  emitToUser(ioOf(req), req.user.id, 'mail:updated', { unread: unreadMail(req.user.id) });
  res.status(201).json({ email: serializeEmail(db.prepare('SELECT * FROM emails WHERE id = ?').get(id), req.user.id), delivered: delivered.length });
}));

router.put('/mail/:id', requireAuth, mailUpload.array('files', 10), wrap((req, res) => {
  const row = db.prepare('SELECT * FROM emails WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Correo no encontrado' });
  if (row.folder !== 'drafts') return res.status(400).json({ error: 'Solo puedes editar borradores' });
  const action = req.body.action === 'draft' ? 'draft' : 'send';
  const payload = {
    to: String(req.body.to ?? row.to_email).trim(),
    cc: String(req.body.cc ?? row.cc).trim(),
    bcc: String(req.body.bcc ?? row.bcc).trim(),
    subject: String(req.body.subject ?? row.subject).trim().slice(0, 200),
    body: String(req.body.body ?? row.body).trim().slice(0, 20000),
  };
  const recipients = parseRecipients(`${payload.to},${payload.cc},${payload.bcc}`);
  if (action === 'send' && (!recipients.length || !payload.subject || !payload.body))
    return res.status(400).json({ error: 'Completa destinatario, asunto y mensaje' });
  const additions = mailAttachments(req.files);
  let attachments = [];
  try { attachments = JSON.parse(row.attachments || '[]'); } catch { attachments = []; }
  attachments = attachments.concat(additions);
  if (action === 'send') {
    db.prepare('DELETE FROM emails WHERE id = ?').run(row.id);
    const id = uid();
    db.prepare(`INSERT INTO emails
      (id,owner_id,sender_id,from_email,to_email,cc,bcc,subject,body,attachments,folder,star,is_read,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, req.user.id, req.user.id, req.user.email, payload.to, payload.cc, payload.bcc,
        payload.subject, payload.body, JSON.stringify(attachments), 'sent', 0, 1, now());
    const delivered = deliverEmail(req, payload, attachments, recipients);
    emitToUser(ioOf(req), req.user.id, 'mail:updated', { unread: unreadMail(req.user.id) });
    return res.json({ email: serializeEmail(db.prepare('SELECT * FROM emails WHERE id = ?').get(id), req.user.id), delivered: delivered.length });
  }
  db.prepare('UPDATE emails SET to_email=?,cc=?,bcc=?,subject=?,body=?,attachments=?,created_at=? WHERE id=?')
    .run(payload.to, payload.cc, payload.bcc, payload.subject, payload.body, JSON.stringify(attachments), now(), row.id);
  res.json({ email: serializeEmail(db.prepare('SELECT * FROM emails WHERE id = ?').get(row.id), req.user.id) });
}));

router.post('/mail/:id/star', requireAuth, wrap((req, res) => {
  const row = db.prepare('SELECT * FROM emails WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Correo no encontrado' });
  db.prepare('UPDATE emails SET star = ? WHERE id = ?').run(row.star ? 0 : 1, row.id);
  emitToUser(ioOf(req), req.user.id, 'mail:updated', { unread: unreadMail(req.user.id) });
  res.json({ star: !row.star });
}));

router.post('/mail/:id/read', requireAuth, wrap((req, res) => {
  const row = db.prepare('SELECT * FROM emails WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Correo no encontrado' });
  db.prepare('UPDATE emails SET is_read = ? WHERE id = ?').run(req.body.read === false ? 0 : 1, row.id);
  emitToUser(ioOf(req), req.user.id, 'mail:updated', { unread: unreadMail(req.user.id) });
  res.json({ ok: true });
}));

router.post('/mail/:id/trash', requireAuth, wrap((req, res) => {
  const row = db.prepare('SELECT * FROM emails WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Correo no encontrado' });
  db.prepare('UPDATE emails SET folder = ? WHERE id = ?').run(row.folder === 'trash' ? 'inbox' : 'trash', row.id);
  emitToUser(ioOf(req), req.user.id, 'mail:updated', { unread: unreadMail(req.user.id) });
  res.json({ ok: true });
}));

router.delete('/mail/:id', requireAuth, wrap((req, res) => {
  const row = db.prepare('SELECT * FROM emails WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Correo no encontrado' });
  db.prepare('DELETE FROM emails WHERE id = ?').run(row.id);
  emitToUser(ioOf(req), req.user.id, 'mail:updated', { unread: unreadMail(req.user.id) });
  res.json({ ok: true });
}));

router.post('/mail/bulk', requireAuth, wrap((req, res) => {
  const raw = Array.isArray(req.body.recipients) ? req.body.recipients.join(',') : String(req.body.recipients || '');
  const recipients = parseRecipients(raw);
  const subject = String(req.body.subject || '').trim().slice(0, 200);
  const body = String(req.body.body || '').trim().slice(0, 20000);
  if (!recipients.length) return res.status(400).json({ error: 'Agrega destinatarios' });
  if (recipients.length > 100) return res.status(400).json({ error: 'Máximo 100 destinatarios por campaña' });
  if (!subject || !body) return res.status(400).json({ error: 'Completa asunto y mensaje' });
  const allowed = new Set(db.prepare('SELECT email FROM mail_contacts WHERE user_id = ?').all(req.user.id).map((c) => c.email));
  const invalid = recipients.filter((email) => !allowed.has(email));
  if (invalid.length) return res.status(400).json({ error: `Solo puedes enviar a contactos: ${invalid.slice(0, 3).join(', ')}` });

  const id = uid();
  db.prepare(`INSERT INTO emails
    (id,owner_id,sender_id,from_email,to_email,cc,bcc,subject,body,attachments,folder,star,is_read,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, req.user.id, req.user.id, req.user.email, recipients.join(', '), '', '', subject, body, '[]', 'sent', 0, 1, now());
  const delivered = deliverEmail(req, { to: recipients.join(', '), cc: '', bcc: '', subject, body }, [], recipients);
  emitToUser(ioOf(req), req.user.id, 'mail:updated', { unread: unreadMail(req.user.id) });
  res.json({ email: serializeEmail(db.prepare('SELECT * FROM emails WHERE id = ?').get(id), req.user.id), delivered: delivered.length });
}));

router.use((err, req, res, next) => {
  console.error('[API]', err);
  if (res.headersSent) return next(err);
  const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : /archivo|tipo/i.test(err.message) ? 400 : 500;
  res.status(status).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'El archivo supera los 30 MB' : err.message || 'Error interno' });
});

module.exports = router;
