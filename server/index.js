'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { DATA_DIR, UPLOAD_DIR } = require('./db');
const routes = require('./routes');
const setupRealtime = require('./realtime');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
  maxHttpBufferSize: 2e6,
});

app.set('io', io);
app.disable('x-powered-by');

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ ok: true, service: 'nexo-chat', time: Date.now() }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', fallthrough: true }));
app.use('/api', routes);
app.use(express.static(path.join(__dirname, '..', 'public'), { index: false, maxAge: 0 }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

app.use((err, req, res, next) => {
  console.error('[HTTP]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

setupRealtime(io);

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nexo Chat escuchando en http://0.0.0.0:${PORT}`);
  console.log(`📦 Datos: ${DATA_DIR}`);
});
