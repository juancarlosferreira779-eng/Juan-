'use strict';

const { db, now, uid } = require('./db');
const { userFromHandshake, publicUser } = require('./auth');
const { onlineUsers, userSockets, isMember, emitPresence } = require('./helpers');

module.exports = function setupRealtime(io) {
  io.use((socket, next) => {
    const user = userFromHandshake(socket.handshake);
    if (!user) return next(new Error('No autorizado'));
    socket.data.user = user;
    next();
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    const userId = user.id;

    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket);
    onlineUsers.add(userId);
    db.prepare('UPDATE users SET last_seen = ? WHERE id = ?').run(now(), userId);

    socket.join(`user:${userId}`);
    const memberships = db.prepare('SELECT chat_id FROM chat_members WHERE user_id = ?').all(userId);
    for (const m of memberships) socket.join(`chat:${m.chat_id}`);

    socket.emit('ready', { user: publicUser(user), onlineCount: onlineUsers.size });
    emitPresence(io, userId);

    socket.on('chat:join', (payload, ack) => {
      const chatId = String(payload?.chatId || '');
      if (!isMember(chatId, userId)) return ack?.({ ok: false, error: 'Sin acceso' });
      socket.join(`chat:${chatId}`);
      ack?.({ ok: true });
    });

    socket.on('typing', (payload) => {
      const chatId = String(payload?.chatId || '');
      if (!isMember(chatId, userId)) return;
      socket.to(`chat:${chatId}`).emit('typing', {
        chatId, userId, name: user.name, typing: Boolean(payload.typing),
      });
    });

    socket.on('call:invite', (payload, ack) => {
      const calleeId = String(payload?.calleeId || '');
      const chatId = String(payload?.chatId || '');
      const kind = payload?.kind === 'video' ? 'video' : 'voice';
      const callee = db.prepare('SELECT * FROM users WHERE id = ? AND is_banned = 0').get(calleeId);
      if (!callee || calleeId === userId) return ack?.({ ok: false, error: 'Usuario no disponible' });
      if (chatId && !isMember(chatId, userId)) return ack?.({ ok: false, error: 'Sin acceso al chat' });

      const callId = uid();
      db.prepare(`INSERT INTO calls (id,caller_id,callee_id,chat_id,kind,status,created_at) VALUES (?,?,?,?,?,?,?)`)
        .run(callId, userId, calleeId, chatId, kind, 'ringing', now());
      socket.join(`call:${callId}`);
      const sockets = userSockets.get(calleeId);
      if (sockets) for (const s of sockets) s.join(`call:${callId}`);
      const roomSockets = userSockets.get(calleeId);
      if (roomSockets) {
        for (const s of roomSockets) s.emit('call:incoming', {
          callId, chatId, kind, from: publicUser(user),
        });
      } else {
        ack?.({ ok: false, error: 'El usuario no está en línea', callId });
        db.prepare("UPDATE calls SET status = 'missed', ended_at = ? WHERE id = ?").run(now(), callId);
        return;
      }
      ack?.({ ok: true, callId });

      const timeout = setTimeout(() => {
        const call = db.prepare('SELECT status FROM calls WHERE id = ?').get(callId);
        if (call && call.status === 'ringing') {
          db.prepare("UPDATE calls SET status = 'missed', ended_at = ? WHERE id = ?").run(now(), callId);
          io.to(`call:${callId}`).emit('call:ended', { callId, reason: 'missed', by: userId });
        }
      }, 60000);
      socket.once('call:cleanup', () => clearTimeout(timeout));
    });

    socket.on('call:signal', (payload, ack) => {
      const callId = String(payload?.callId || '');
      const to = String(payload?.to || '');
      const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(callId);
      if (!call || ![call.caller_id, call.callee_id].includes(userId)) return ack?.({ ok: false });
      io.to(`user:${to}`).emit('call:signal', { callId, from: userId, data: payload.data });
      ack?.({ ok: true });
    });

    socket.on('call:answer', (payload, ack) => {
      const callId = String(payload?.callId || '');
      const accepted = Boolean(payload?.accepted);
      const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(callId);
      if (!call || call.callee_id !== userId) return ack?.({ ok: false });
      db.prepare('UPDATE calls SET status = ?, ended_at = ? WHERE id = ?')
        .run(accepted ? 'active' : 'rejected', accepted ? 0 : now(), callId);
      io.to(`user:${call.caller_id}`).emit(accepted ? 'call:answered' : 'call:rejected', {
        callId, by: userId, kind: call.kind,
      });
      ack?.({ ok: true });
    });

    socket.on('call:end', (payload, ack) => {
      const callId = String(payload?.callId || '');
      const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(callId);
      if (!call || ![call.caller_id, call.callee_id].includes(userId)) return ack?.({ ok: false });
      if (call.ended_at) return ack?.({ ok: true });
      db.prepare('UPDATE calls SET status = ?, ended_at = ? WHERE id = ?').run('ended', now(), callId);
      const other = call.caller_id === userId ? call.callee_id : call.caller_id;
      io.to(`user:${other}`).emit('call:ended', { callId, by: userId, reason: 'hungup' });
      io.to(`call:${callId}`).emit('call:cleanup');
      ack?.({ ok: true });
    });

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket);
        if (!sockets.size) userSockets.delete(userId);
      }
      const activeCalls = db.prepare(`SELECT * FROM calls WHERE ended_at = 0 AND (caller_id = ? OR callee_id = ?)`).all(userId, userId);
      for (const call of activeCalls) {
        db.prepare("UPDATE calls SET status = 'ended', ended_at = ? WHERE id = ?").run(now(), call.id);
        const other = call.caller_id === userId ? call.callee_id : call.caller_id;
        io.to(`user:${other}`).emit('call:ended', { callId: call.id, by: userId, reason: 'disconnected' });
      }
      if (!userSockets.has(userId)) {
        onlineUsers.delete(userId);
        db.prepare('UPDATE users SET last_seen = ? WHERE id = ?').run(now(), userId);
        emitPresence(io, userId);
      }
    });
  });
};
