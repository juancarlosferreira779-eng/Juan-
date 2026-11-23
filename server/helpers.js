'use strict';

const path = require('path');
const fs = require('fs');
const { db, UPLOAD_DIR, now, uid } = require('./db');
const { publicUser } = require('./auth');

const onlineUsers = new Set();
const userSockets = new Map();

function isMember(chatId, userId) {
  return Boolean(db.prepare('SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ?').get(chatId, userId));
}

function chatName(chat, viewerId) {
  if (chat.type !== 'direct') return chat.name || 'Grupo';
  const other = db.prepare(`
    SELECT u.* FROM chat_members cm JOIN users u ON u.id = cm.user_id
    WHERE cm.chat_id = ? AND cm.user_id != ? LIMIT 1
  `).get(chat.id, viewerId);
  return other ? other.name : 'Chat';
}

function serializeChat(chat, viewerId) {
  const members = db.prepare(`
    SELECT u.id, u.name, u.avatar, u.color, u.status, u.phone, cm.role, u.last_seen
    FROM chat_members cm JOIN users u ON u.id = cm.user_id
    WHERE cm.chat_id = ? ORDER BY cm.joined_at ASC
  `).all(chat.id).map((m) => ({ ...m, online: onlineUsers.has(m.id), last_seen: m.last_seen || 0 }));

  const last = db.prepare(`
    SELECT id, text, kind, sender_id, created_at, deleted FROM messages
    WHERE chat_id = ? AND deleted = 0 ORDER BY created_at DESC LIMIT 1
  `).get(chat.id);

  const read = db.prepare('SELECT last_read_at FROM chat_reads WHERE chat_id = ? AND user_id = ?').get(chat.id, viewerId);
  const unread = db.prepare(`
    SELECT COUNT(*) AS n FROM messages WHERE chat_id = ? AND sender_id != ? AND created_at > ?
  `).get(chat.id, viewerId, read ? read.last_read_at : 0).n;

  let avatar = chat.avatar || '';
  if (chat.type === 'direct') {
    const other = members.find((m) => m.id !== viewerId);
    if (other) avatar = other.avatar || '';
  }

  return {
    id: chat.id,
    type: chat.type,
    name: chatName(chat, viewerId),
    avatar,
    color: chat.type === 'direct' && members.find((m) => m.id !== viewerId)?.color,
    description: chat.description || '',
    members,
    lastMessage: last ? {
      id: last.id,
      text: previewText(last),
      kind: last.kind,
      senderId: last.sender_id,
      createdAt: last.created_at,
    } : null,
    unread,
    createdAt: chat.created_at,
  };
}

function previewText(msg) {
  if (!msg) return '';
  if (msg.deleted) return 'Mensaje eliminado';
  switch (msg.kind) {
    case 'image': return '📷 Foto';
    case 'video': return '🎥 Video';
    case 'audio': return '🎤 Nota de voz';
    case 'file': return '📎 Archivo';
    case 'gif': return '🎞️ GIF';
    case 'sticker': return '✨ Sticker';
    default: return msg.text || '';
  }
}

function listChats(userId) {
  return db.prepare(`
    SELECT c.* FROM chats c JOIN chat_members cm ON cm.chat_id = c.id
    WHERE cm.user_id = ? ORDER BY COALESCE((SELECT MAX(created_at) FROM messages WHERE chat_id = c.id), c.created_at) DESC
  `).all(userId).map((c) => serializeChat(c, userId));
}

function serializeMessage(msg, viewerId) {
  const sender = db.prepare('SELECT id,name,avatar,color FROM users WHERE id = ?').get(msg.sender_id);
  const reactions = db.prepare('SELECT user_id,emoji FROM message_reactions WHERE message_id = ?').all(msg.id);
  const reply = msg.reply_to ? db.prepare('SELECT id,text,kind,sender_id,deleted FROM messages WHERE id = ?').get(msg.reply_to) : null;
  let replyTo = null;
  if (reply) {
    const replySender = db.prepare('SELECT name FROM users WHERE id = ?').get(reply.sender_id);
    replyTo = { id: reply.id, text: previewText(reply), senderName: replySender?.name || 'Usuario', deleted: Boolean(reply.deleted) };
  }
  return {
    id: msg.id,
    chatId: msg.chat_id,
    senderId: msg.sender_id,
    sender: sender ? publicUser(sender) : { id: '', name: 'Usuario eliminado', avatar: '', color: '#888' },
    kind: msg.kind,
    text: msg.deleted ? '' : msg.text,
    fileUrl: msg.deleted ? '' : msg.file_url,
    fileName: msg.file_name,
    fileMime: msg.file_mime,
    fileSize: msg.file_size,
    duration: msg.duration,
    replyTo,
    createdAt: msg.created_at,
    editedAt: msg.edited_at,
    deleted: Boolean(msg.deleted),
    reactions,
    mine: msg.sender_id === viewerId,
  };
}

function listMessages(chatId, viewerId, limit = 60, before = 0) {
  const rows = before
    ? db.prepare('SELECT * FROM messages WHERE chat_id = ? AND created_at < ? ORDER BY created_at DESC LIMIT ?').all(chatId, before, limit)
    : db.prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT ?').all(chatId, limit);
  return rows.reverse().map((m) => serializeMessage(m, viewerId));
}

function markRead(chatId, userId) {
  const latest = db.prepare('SELECT MAX(created_at) AS t FROM messages WHERE chat_id = ?').get(chatId).t || now();
  const existing = db.prepare('SELECT last_read_at FROM chat_reads WHERE chat_id = ? AND user_id = ?').get(chatId, userId);
  if (!existing || existing.last_read_at < latest) {
    db.prepare(`INSERT INTO chat_reads (chat_id,user_id,last_read_at) VALUES (?,?,?)
      ON CONFLICT(chat_id,user_id) DO UPDATE SET last_read_at = excluded.last_read_at`)
      .run(chatId, userId, latest);
  }
}

function notify(userId, payload) {
  const id = uid();
  db.prepare('INSERT INTO notifications (id,user_id,type,title,body,chat_id,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, userId, payload.type || 'message', payload.title, payload.body, payload.chatId || '', now());
  const sockets = userSockets.get(userId);
  if (sockets) for (const socket of sockets) socket.emit('notification', { id, ...payload, createdAt: now() });
  return id;
}

function saveUpload(file) {
  if (!file) return null;
  const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 10);
  const name = `${uid()}${ext || ''}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), file.buffer);
  return { url: `/uploads/${name}`, name: file.originalname, mime: file.mimetype, size: file.size };
}

function allowedFile(mimetype) {
  return /^(image|video|audio)\//.test(mimetype || '') ||
    ['application/pdf', 'application/zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'application/json'].includes(mimetype);
}

function serializeStory(story, viewerId) {
  const author = db.prepare('SELECT id,name,avatar,color FROM users WHERE id = ?').get(story.user_id);
  const views = db.prepare('SELECT user_id FROM story_views WHERE story_id = ?').all(story.id).map((v) => v.user_id);
  return {
    id: story.id,
    userId: story.user_id,
    author: author ? publicUser(author) : { id: '', name: 'Usuario', avatar: '', color: '#888' },
    kind: story.kind,
    text: story.text,
    fileUrl: story.file_url,
    fileMime: story.file_mime,
    createdAt: story.created_at,
    expiresAt: story.expires_at,
    views,
    viewed: viewerId ? views.includes(viewerId) : false,
    mine: viewerId === story.user_id,
  };
}

function emitToUser(io, userId, event, payload) {
  const sockets = userSockets.get(userId);
  if (sockets) for (const socket of sockets) socket.emit(event, payload);
}

function emitChatUpdated(io, chatId) {
  const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(chatId);
  if (!chat) return;
  const members = db.prepare('SELECT user_id FROM chat_members WHERE chat_id = ?').all(chatId);
  for (const m of members) emitToUser(io, m.user_id, 'chat:updated', serializeChat(chat, m.user_id));
}

function emitPresence(io, userId) {
  const online = onlineUsers.has(userId);
  const user = db.prepare('SELECT id,name,avatar,color FROM users WHERE id = ?').get(userId);
  if (!user) return;
  io.emit('presence', { userId, online, lastSeen: now() });
}

module.exports = {
  onlineUsers,
  userSockets,
  isMember,
  serializeChat,
  serializeMessage,
  listChats,
  listMessages,
  markRead,
  previewText,
  notify,
  saveUpload,
  allowedFile,
  serializeStory,
  emitToUser,
  emitChatUpdated,
  emitPresence,
};
