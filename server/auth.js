'use strict';

const crypto = require('crypto');
const { db, now } = require('./db');

const COOKIE_NAME = 'nexo_sid';
const SESSION_DAYS = 30;

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key) out[key] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const createdAt = now();
  db.prepare('INSERT INTO sessions (token,user_id,created_at,expires_at) VALUES (?,?,?,?)')
    .run(token, userId, createdAt, createdAt + SESSION_DAYS * 86400000);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: SESSION_DAYS * 86400000,
  });
  return token;
}

function destroySession(req, res) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.clearCookie(COOKIE_NAME, { path: '/', sameSite: 'lax' });
}

function userFromRequest(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!token) return null;
  return db.prepare(`
    SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > ? AND u.is_banned = 0
  `).get(token, now()) || null;
}

function userFromHandshake(handshake) {
  const token = parseCookies(handshake.headers.cookie)[COOKIE_NAME];
  if (!token) return null;
  return db.prepare(`
    SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > ? AND u.is_banned = 0
  `).get(token, now()) || null;
}

function requireAuth(req, res, next) {
  const user = userFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Necesitas iniciar sesión' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user.is_admin) return res.status(403).json({ error: 'Acceso de administrador requerido' });
  next();
}

function publicUser(user) {
  if (!user) return null;
  const { password_hash, is_banned, ...safe } = user;
  safe.is_admin = Boolean(user.is_admin);
  safe.online = false;
  return safe;
}

module.exports = {
  COOKIE_NAME,
  parseCookies,
  createSession,
  destroySession,
  userFromRequest,
  userFromHandshake,
  requireAuth,
  requireAdmin,
  publicUser,
};
