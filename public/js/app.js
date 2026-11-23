/* ==========================================================================
   Nexo Chat — cliente web
   ========================================================================== */

/* ------------------------------- Icons -------------------------------- */
const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-4v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L4 17.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H2v-4h.9a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4 6.1 6.8 3.3l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V2h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.9 6l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1H22v4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
  'phone-off': '<path d="M10.7 5.1A16 16 0 0 1 14.2 7l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2v3a2 2 0 0 1-2 2h-2M3 3l18 18"/><path d="M8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  'video-off': '<path d="M10.7 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3M22 8l-6 4 6 4"/><path d="M3 3l18 18"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/>',
  clip: '<path d="m21.4 11.6-8.5 8.5a6 6 0 0 1-8.5-8.5l8.5-8.5a4 4 0 0 1 5.7 5.7l-8.5 8.5a2 2 0 0 1-2.8-2.8l7.8-7.8"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0M12 17v5"/>',
  'mic-off': '<path d="M3 3l18 18M9 9v2a3 3 0 0 0 4.6 2.5M15 9V5a3 3 0 0 0-5.7-1.3M19 10a7 7 0 0 1-.9 3.4M5 10a7 7 0 0 0 11 5.7M12 17v5"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  'check-double': '<path d="m2 12 5 5L17 7M11 17l2 2 8-8"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7M19 12H5"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>',
  play: '<path d="m7 4 12 8-12 8V4Z"/>',
  sparkles: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
  zap: '<path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"/>',
  reply: '<path d="M9 17 4 12l5-5M4 12h10a6 6 0 0 1 6 6v1"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  chart: '<path d="M3 3v18h18M7 16l4-5 4 3 5-7"/>',
  broadcast: '<path d="M3 11v2a9 9 0 0 0 18 0v-2M12 3v9M8 7a6 6 0 0 1 8 0M5 4a11 11 0 0 1 14 0"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
    delete el.dataset.icon;
  });
}
function setHTML(el, html) { el.innerHTML = html; hydrateIcons(el); return el; }
const $ = (sel) => document.querySelector(sel);

/* ------------------------------ Helpers ------------------------------- */
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtTime = (ts) => new Date(Number(ts) || Date.now()).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
function fmtDay(ts) {
  const d = new Date(Number(ts)); const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  const y = new Date(today); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
}
function relativeTime(ts) {
  const diff = Date.now() - Number(ts);
  if (diff < 60000) return 'ahora';
  if (diff < 3600000) return `hace ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)} h`;
  return fmtDay(ts);
}
function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
function initials(name = '') { return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '?'; }
function avatarHTML(user = {}, extra = '') {
  const cls = `avatar ${extra}`;
  if (user.avatar) return `<img class="${cls}" src="${esc(user.avatar)}" alt="" loading="lazy" />`;
  const color = user.color || '#7c5cff';
  return `<span class="${cls}" style="background:linear-gradient(135deg,${esc(color)},#253b4a)">${esc(initials(user.name))}</span>`;
}
function toast(title, body = '', type = '') {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div style="flex:1"><strong>${esc(title)}</strong>${body ? `<small>${esc(body)}</small>` : ''}</div><button data-action="dismiss-toast" aria-label="Cerrar">×</button>`;
  root.appendChild(el);
  setTimeout(() => el.remove(), 4800);
}

/* ------------------------------- API ---------------------------------- */
async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, { credentials: 'same-origin', ...options });
  let data = {};
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}
const json = (method, path, body) => api(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
const form = (path, data) => api(path, { method: 'POST', body: data });

/* ------------------------------- State -------------------------------- */
const AI_CHAT = {
  id: 'ai', type: 'ai', name: 'Nexo IA', description: 'Tu asistente inteligente',
  members: [], unread: 0, lastMessage: null,
};
const state = {
  me: null,
  chats: [],
  activeChat: null,
  activeChatId: null,
  messages: [],
  aiMessages: [],
  users: [],
  stories: [],
  notifications: [],
  socket: null,
  chatFilter: '',
  searchResults: [],
  detailsMode: null,
  replyTo: null,
  editingId: null,
  typingUser: null,
  theme: localStorage.getItem('nexo-theme') || 'light',
  pendingCall: null,
};
let call = null; // instanciada después de definir CallManager

/* ---------------------------- Auth screen ----------------------------- */
let authMode = 'login';
function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  $('#register-fields').classList.toggle('hidden', mode !== 'register');
  $('#auth-title').textContent = mode === 'register' ? 'Crea tu cuenta' : 'Inicia sesión';
  $('#auth-subtitle').textContent = mode === 'register' ? 'Únete a Nexo Chat en menos de un minuto.' : 'Bienvenido de nuevo. Tu conversación te espera.';
  $('#auth-submit').textContent = mode === 'register' ? 'Crear cuenta' : 'Entrar a Nexo';
  $('#auth-error').classList.add('hidden');
}

async function submitAuth(email, password, name, description) {
  const errorBox = $('#auth-error');
  errorBox.classList.add('hidden');
  try {
    const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
    const body = authMode === 'register' ? { name, email, password, description } : { email, password };
    const { user } = await json('POST', endpoint, body);
    state.me = user;
    $('#auth-form').reset();
    await enterApp();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.remove('hidden');
  }
}

/* --------------------------- App bootstrap ---------------------------- */
async function boot() {
  document.documentElement.dataset.theme = state.theme;
  hydrateIcons();
  bindGlobalEvents();
  try {
    const { user } = await api('/me');
    state.me = user;
    await enterApp();
  } catch {
    $('#auth-view').classList.remove('hidden');
  }
}

async function enterApp() {
  $('#auth-view').classList.add('hidden');
  $('#app-view').classList.remove('hidden');
  renderMyProfile();
  loadAI();
  connectSocket();
  await Promise.all([loadChats(), loadStories(), loadNotifications()]);
  renderChatList();
  renderStories();
  renderNotificationsBadge();
  if (state.me.is_admin && !document.querySelector('.icon-actions [data-action="admin-panel"]')) {
    const btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.dataset.action = 'admin-panel';
    btn.title = 'Panel de administración';
    btn.innerHTML = icon('shield');
    $('.icon-actions').appendChild(btn);
  }
}

function connectSocket() {
  if (state.socket) return;
  const socket = io({ withCredentials: true, transports: ['websocket', 'polling'] });
  state.socket = socket;
  socket.on('connect', () => { if (state.activeChatId && state.activeChatId !== 'ai') socket.emit('chat:join', { chatId: state.activeChatId }); });
  socket.on('ready', (data) => { if (data.user) state.me = { ...state.me, ...data.user }; });
  socket.on('chat:new', (chat) => { upsertChat(chat); renderChatList(); toast('Nuevo chat', chat.name); });
  socket.on('chat:updated', (chat) => { upsertChat(chat); renderChatList(); if (state.activeChatId === chat.id) renderHeader(); });
  socket.on('message:new', ({ chatId, message }) => {
    if (state.activeChatId === chatId) { upsertMessage(message); renderMessages(true); }
    else { const c = state.chats.find((x) => x.id === chatId); if (c) { c.lastMessage = { text: message.text, kind: message.kind, senderId: message.senderId, createdAt: message.createdAt }; if (message.senderId !== state.me?.id) c.unread = (c.unread || 0) + 1; } }
    renderChatList();
  });
  socket.on('message:updated', ({ chatId, message }) => { if (state.activeChatId === chatId) { upsertMessage(message); renderMessages(); } });
  socket.on('message:deleted', ({ messageId }) => {
    const found = state.messages.find((m) => m.id === messageId);
    if (found) { found.deleted = true; found.text = ''; found.fileUrl = ''; renderMessages(); }
  });
  socket.on('message:reaction', ({ messageId, reactions }) => {
    const found = state.messages.find((m) => m.id === messageId);
    if (found) { found.reactions = reactions; renderMessages(); }
  });
  socket.on('typing', (data) => {
    if (data.chatId !== state.activeChatId || data.userId === state.me?.id) return;
    state.typingUser = data.typing ? data.name : null;
    renderTyping();
  });
  socket.on('notification', (notification) => {
    state.notifications.unshift({ ...notification, read: false });
    renderNotificationsBadge();
    if (state.detailsMode === 'notifications') renderDetails();
    toast(notification.title, notification.body);
    if ('Notification' in window && Notification.permission === 'granted') {
      try { new Notification(notification.title, { body: notification.body }); } catch { /* ignore */ }
    }
  });
  socket.on('presence', ({ userId, online }) => {
    state.chats.forEach((c) => c.members?.forEach((m) => { if (m.id === userId) m.online = online; }));
    renderChatList();
    if (state.activeChat) renderHeader();
  });
  socket.on('story:new', () => loadStories().then(renderStories));
  socket.on('story:deleted', ({ storyId }) => { state.stories = state.stories.filter((s) => s.id !== storyId); renderStories(); });
  socket.on('profile:updated', (data) => {
    if (data.userId === state.me.id) state.me = { ...state.me, ...data };
    state.chats.forEach((c) => c.members?.forEach((m) => { if (m.id === data.userId) Object.assign(m, data); }));
    state.stories.forEach((s) => { if (s.userId === data.userId && data.avatar) s.author.avatar = data.avatar; });
    renderMyProfile(); renderChatList(); renderStories(); if (state.activeChat) renderHeader();
  });
  socket.on('force:logout', (data) => { toast('Sesión cerrada', data.reason, 'error'); setTimeout(() => doLogout(), 900); });
  socket.on('call:incoming', (p) => call.incomingCall(p));
  socket.on('call:signal', (p) => call.handleSignal(p));
  socket.on('call:answered', () => call.onAnswered());
  socket.on('call:rejected', () => call.end('La llamada fue rechazada'));
  socket.on('call:ended', (p) => call.remoteEnd(p));
  socket.on('disconnect', () => call.cleanup());
}

/* ----------------------------- Data load ------------------------------ */
async function loadChats() {
  const { chats } = await api('/chats');
  state.chats = [AI_CHAT, ...chats];
  renderChatList();
}
async function loadStories() {
  try { const { stories } = await api('/stories'); state.stories = stories; } catch { /* ignore */ }
}
async function loadNotifications() {
  try { const { notifications } = await api('/notifications'); state.notifications = notifications; } catch { /* ignore */ }
}
function loadAI() {
  try { state.aiMessages = JSON.parse(localStorage.getItem(`nexo-ai-${state.me.id}`) || '[]'); } catch { state.aiMessages = []; }
}
function saveAI() { localStorage.setItem(`nexo-ai-${state.me.id}`, JSON.stringify(state.aiMessages.slice(-80))); }
function upsertChat(chat) {
  const idx = state.chats.findIndex((c) => c.id === chat.id);
  if (idx >= 0) state.chats[idx] = chat; else state.chats.push(chat);
}
function upsertMessage(message) {
  const idx = state.messages.findIndex((m) => m.id === message.id);
  if (idx >= 0) state.messages[idx] = message; else state.messages.push(message);
  state.messages.sort((a, b) => a.createdAt - b.createdAt);
}

/* ----------------------------- Rendering ------------------------------ */
function renderMyProfile() {
  const me = state.me || {};
  setHTML($('#my-profile'), `
    ${avatarHTML(me)}
    <span class="my-profile-info"><strong>${esc(me.name)}</strong><small>${esc(me.status || 'Disponible')}</small></span>
    <span data-icon="chevron" style="color:var(--muted)"></span>
  `);
}

function renderStories() {
  const strip = $('#stories-strip');
  const authors = new Map();
  state.stories.forEach((s) => {
    if (!authors.has(s.userId)) authors.set(s.userId, []);
    authors.get(s.userId).push(s);
  });
  const mine = state.stories.filter((s) => s.mine);
  let html = `<button class="story-item story-add" data-action="create-story"><span class="story-ring"></span><span>Mi estado</span></button>`;
  if (mine.length) {
    html = `<button class="story-item ${mine.every((s) => s.viewed) ? 'seen' : ''}" data-action="view-story" data-id="${mine[0].id}">
      <span class="story-ring">${avatarHTML(state.me)}</span><span>Tu estado</span></button>` + html;
  }
  for (const [userId, stories] of authors) {
    if (userId === state.me.id) continue;
    const s = stories[0];
    html += `<button class="story-item ${stories.every((x) => x.viewed) ? 'seen' : ''}" data-action="view-story" data-id="${s.id}">
      <span class="story-ring">${avatarHTML(s.author)}</span><span>${esc(s.author.name.split(' ')[0])}</span></button>`;
  }
  setHTML(strip, html);
}

function renderChatList() {
  const list = $('#chat-list');
  const filter = state.chatFilter.trim().toLowerCase();
  let chats = [...state.chats];
  if (filter) {
    const matchingIds = new Set(state.searchResults.map((r) => r.chatId));
    chats = chats.filter((c) => c.name.toLowerCase().includes(filter) ||
      (c.lastMessage?.text || '').toLowerCase().includes(filter) || matchingIds.has(c.id));
  }
  if (!chats.length) { setHTML(list, `<div class="chat-empty">No se encontraron chats.</div>`); return; }
  setHTML(list, chats.map((c) => {
    const other = c.members?.find((m) => m.id !== state.me.id);
    const online = c.type === 'direct' && other?.online;
    const snippet = state.searchResults.find((r) => r.chatId === c.id);
    const lastText = snippet ? `🔎 ${snippet.text}` : (c.lastMessage?.text || (c.type === 'ai' ? 'Tu asistente inteligente' : 'Nuevo chat'));
    const ts = c.lastMessage?.createdAt;
    return `<button class="chat-item ${state.activeChatId === c.id ? 'active' : ''}" data-action="select-chat" data-id="${c.id}">
      ${c.type === 'ai'
        ? '<span class="avatar" style="background:linear-gradient(135deg,#7c5cff,#0aa884);font-size:20px">✦</span>'
        : avatarHTML({ avatar: c.avatar, color: c.color, name: c.name })}
      <span class="chat-line">
        <span class="chat-line-top"><span class="chat-name">${esc(c.name)}</span><span class="chat-time">${ts ? fmtTime(ts) : ''}</span></span>
        <span class="chat-preview"><span>${esc(lastText)}</span>${(c.unread || 0) > 0 ? `<i class="unread-badge">${c.unread}</i>` : ''}</span>
      </span>
      ${online ? '<i class="online-dot"></i>' : ''}
    </button>`;
  }).join(''));
}

function renderHeader() {
  const chat = state.activeChat;
  if (!chat) return;
  let status = '';
  if (chat.type === 'ai') status = 'Asistente inteligente · siempre en línea';
  else if (chat.type === 'direct') {
    const other = chat.members?.find((m) => m.id !== state.me.id);
    status = other?.online ? 'En línea' : (other?.status || 'Desconectado');
  } else status = `${chat.members?.length || 0} integrantes`;
  setHTML($('#chat-header-profile'), `
    ${chat.type === 'ai' ? '<span class="avatar" style="background:linear-gradient(135deg,#7c5cff,#0aa884);font-size:19px">✦</span>' : avatarHTML({ avatar: chat.avatar, color: chat.color, name: chat.name })}
    <span class="chat-header-info"><strong>${esc(chat.name)}</strong><small>${esc(status)}</small></span>
  `);
  document.querySelectorAll('[data-action="call-voice"], [data-action="call-video"]').forEach((b) => {
    b.style.display = chat.type === 'ai' ? 'none' : '';
  });
}

function messageHTML(m) {
  const mine = m.mine ?? (m.senderId === state.me.id);
  const sender = m.sender || { name: 'Usuario', avatar: '', color: '#888' };
  const showName = !mine && state.activeChat?.type !== 'direct' && state.activeChat?.type !== 'ai';
  let body = '';
  if (m.deleted) body = '<div class="message-text">Mensaje eliminado</div>';
  else if (m.kind === 'sticker') body = `<div class="message-text sticker">${esc(m.text)}</div>`;
  else if (m.kind === 'gif') body = `<div class="message-media message-gif"><img src="${esc(m.fileUrl || m.text)}" alt="GIF" loading="lazy" /></div>`;
  else if (m.kind === 'image') body = `<div class="message-media"><img src="${esc(m.fileUrl)}" alt="${esc(m.fileName || 'Imagen')}" loading="lazy" data-action="open-image" data-id="${m.id}" /></div>`;
  else if (m.kind === 'video') body = `<div class="message-media video"><video src="${esc(m.fileUrl)}" controls playsinline></video></div>`;
  else if (m.kind === 'audio') {
    const bars = Array.from({ length: 18 }, (_, i) => `<i style="height:${25 + ((i * 37) % 65)}%"></i>`).join('');
    body = `<div class="message-audio"><button class="audio-play" data-action="play-audio" data-id="${m.id}">${icon('play')}</button><span class="audio-wave">${bars}</span><span class="audio-duration">0:${String(m.duration || 3).padStart(2, '0')}</span><audio id="audio-${m.id}" src="${esc(m.fileUrl)}" preload="none"></audio></div>`;
  } else if (m.kind === 'file') body = `<a class="message-file" href="${esc(m.fileUrl)}" download="${esc(m.fileName || 'archivo')}" style="text-decoration:none;color:inherit">
      <span class="file-icon">${icon('file')}</span><span style="min-width:0"><strong>${esc(m.fileName || 'Archivo')}</strong><small>${fmtSize(m.fileSize)} · Descargar</small></span></a>`;
  else body = `<div class="message-text">${esc(m.text).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:inherit">$1</a>')}</div>`;

  const isAI = state.activeChat?.type === 'ai';
  const actions = (m.deleted || isAI) ? '' : `<span class="message-actions">
      <button data-action="msg-reply" data-id="${m.id}" title="Responder">${icon('reply')}</button>
      <button data-action="msg-react" data-id="${m.id}" title="Reaccionar">${icon('smile')}</button>
      ${mine && m.kind === 'text' ? `<button data-action="msg-edit" data-id="${m.id}" title="Editar">${icon('edit')}</button>` : ''}
      ${mine || state.activeChat?.type === 'group' ? `<button data-action="msg-delete" data-id="${m.id}" title="Eliminar">${icon('trash')}</button>` : ''}
    </span>`;
  const reactions = (!isAI && (m.reactions || []).length)
    ? `<div class="reactions">${m.reactions.map((r) => `<button class="reaction-chip" data-action="react" data-id="${m.id}" data-emoji="${esc(r.emoji)}">${esc(r.emoji)}</button>`).join('')}</div>` : '';
  return `<div class="message-row ${mine ? 'mine' : ''}" data-message-id="${m.id}">
    ${!mine && state.activeChat?.type !== 'ai' ? avatarHTML(sender) : ''}
    <div class="bubble ${m.deleted ? 'deleted' : ''}">
      ${showName ? `<div class="sender-name">${esc(sender.name)}</div>` : ''}
      ${m.replyTo ? `<div class="reply-preview"><strong>${esc(m.replyTo.senderName)}</strong><span>${esc(m.replyTo.text)}</span></div>` : ''}
      ${body}
      ${actions}
      ${reactions}
      <div class="message-meta">${m.editedAt ? '<span>editado</span>' : ''}<span>${fmtTime(m.createdAt)}</span>${mine ? '<span class="ticks">✓✓</span>' : ''}</div>
    </div>
  </div>`;
}

function renderMessages(forceScroll = false) {
  const container = $('#messages');
  const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 180;
  const messages = [...state.messages];
  let html = '';
  let lastDay = '';
  for (const m of messages) {
    const day = new Date(m.createdAt).toDateString();
    if (day !== lastDay) { html += `<div class="date-separator"><span>${esc(fmtDay(m.createdAt))}</span></div>`; lastDay = day; }
    html += messageHTML(m);
  }
  setHTML(container, html || `<div class="chat-empty">${state.activeChat?.type === 'ai'
    ? '¡Hola! Soy Nexo IA. Pregúntame lo que quieras ✨' : 'Aún no hay mensajes. ¡Escribe el primero!'}</div>`);
  if (forceScroll || nearBottom) requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
}

function renderTyping() {
  const el = $('#typing-indicator');
  if (state.typingUser) {
    el.textContent = `${state.typingUser} está escribiendo…`;
    el.classList.remove('hidden');
  } else el.classList.add('hidden');
}

function renderComposerBanner() {
  const el = $('#composer-banner');
  if (state.editingId) {
    const m = state.messages.find((x) => x.id === state.editingId);
    setHTML(el, `<span data-icon="edit"></span><div><strong>Editando mensaje</strong><br/><span class="muted">${esc((m?.text || '').slice(0, 70))}</span></div><button class="text-btn" data-action="cancel-compose">Cancelar</button>`);
    el.classList.remove('hidden');
  } else if (state.replyTo) {
    setHTML(el, `<span data-icon="reply"></span><div><strong>Respondiendo a ${esc(state.replyTo.sender?.name || 'Usuario')}</strong><br/><span class="muted">${esc((state.replyTo.text || '').slice(0, 70))}</span></div><button class="text-btn" data-action="cancel-compose">Cancelar</button>`);
    el.classList.remove('hidden');
  } else el.classList.add('hidden');
}

function renderNotificationsBadge() {
  const count = state.notifications.filter((n) => !n.read).length;
  const badge = $('#notif-badge');
  badge.classList.toggle('hidden', !count);
}

/* --------------------------- Chat selection --------------------------- */
async function selectChat(id) {
  state.activeChatId = id;
  state.replyTo = null; state.editingId = null; state.typingUser = null;
  renderComposerBanner(); renderTyping();
  $('#empty-state').classList.add('hidden');
  $('#chat-content').classList.remove('hidden');
  $('#chat-area').classList.add('mobile-open');
  $('#sidebar').classList.add('hidden-mobile');
  if (id === 'ai') {
    state.activeChat = AI_CHAT;
    state.messages = state.aiMessages;
  } else {
    const chat = state.chats.find((c) => c.id === id);
    if (!chat) return;
    state.activeChat = chat;
    try {
      const { messages } = await api(`/chats/${id}/messages?limit=80`);
      state.messages = messages;
      state.socket?.emit('chat:join', { chatId: id });
      if (state.socket) await json('POST', `/chats/${id}/read`, {});
      else await json('POST', `/chats/${id}/read`, {});
      upsertChat({ ...chat, unread: 0 });
      renderChatList();
    } catch (err) { toast('No se pudo abrir el chat', err.message, 'error'); }
  }
  renderHeader(); renderMessages(true);
  if (state.detailsMode === 'info') renderDetails();
}

function closeChat() {
  $('#chat-content').classList.add('hidden');
  $('#empty-state').classList.remove('hidden');
  $('#chat-area').classList.remove('mobile-open');
  $('#sidebar').classList.remove('hidden-mobile');
  state.activeChatId = null; state.activeChat = null; state.messages = [];
}

/* ------------------------- Sending messages --------------------------- */
async function sendMessage() {
  const input = $('#message-input');
  const text = input.value.trim();
  const chatId = state.activeChatId;
  if (!chatId) return;
  if (!text) return;
  if (chatId === 'ai') { input.value = ''; input.style.height = 'auto'; return sendAI(text); }

  try {
    if (state.editingId) {
      const { message } = await json('PATCH', `/messages/${state.editingId}`, { text });
      upsertMessage(message); renderMessages();
      state.editingId = null; input.value = ''; renderComposerBanner();
      return;
    }
    const fd = new FormData();
    fd.append('text', text);
    fd.append('kind', 'text');
    if (state.replyTo) fd.append('replyTo', state.replyTo.id);
    const { message } = await form(`/chats/${chatId}/messages`, fd);
    upsertMessage(message); renderMessages(true);
    input.value = ''; input.style.height = 'auto';
    state.replyTo = null; renderComposerBanner();
    state.socket?.emit('typing', { chatId, typing: false });
  } catch (err) { toast('No se pudo enviar', err.message, 'error'); }
}

async function sendCustom(kind, value) {
  const chatId = state.activeChatId;
  if (!chatId || chatId === 'ai') return toast('No puedes enviar eso a la IA', 'error');
  try {
    const fd = new FormData();
    fd.append('kind', kind);
    fd.append('text', value);
    const { message } = await form(`/chats/${chatId}/messages`, fd);
    upsertMessage(message); renderMessages(true);
  } catch (err) { toast('No se pudo enviar', err.message, 'error'); }
}

async function sendFiles(files) {
  const chatId = state.activeChatId;
  if (!chatId || chatId === 'ai') return toast('Selecciona un chat para adjuntar archivos', 'error');
  for (const file of files) {
    if (file.size > 30 * 1024 * 1024) { toast('Archivo demasiado grande', `${file.name} supera 30 MB`, 'error'); continue; }
    const fd = new FormData();
    fd.append('file', file, file.name);
    if (state.replyTo) fd.append('replyTo', state.replyTo.id);
    try { const { message } = await form(`/chats/${chatId}/messages`, fd); upsertMessage(message); renderMessages(true); }
    catch (err) { toast('No se pudo enviar el archivo', err.message, 'error'); }
  }
  state.replyTo = null; renderComposerBanner();
}

async function sendAI(text) {
  const push = (m) => { state.aiMessages.push(m); state.messages = state.aiMessages; saveAI(); renderMessages(true); };
  push({ id: uid(), mine: true, text, createdAt: Date.now() });
  const placeholderId = uid();
  push({ id: placeholderId, mine: false, text: 'Pensando…', createdAt: Date.now(), pending: true });
  try {
    const history = state.aiMessages.filter((m) => !m.pending && m.id !== placeholderId).slice(-12).map((m) => ({ role: m.mine ? 'user' : 'assistant', content: m.text }));
    const { text: reply } = await json('POST', '/ai', { message: text, history });
    state.aiMessages = state.aiMessages.filter((m) => m.id !== placeholderId);
    push({ id: uid(), mine: false, text: reply, createdAt: Date.now() });
  } catch (err) {
    state.aiMessages = state.aiMessages.filter((m) => m.id !== placeholderId);
    push({ id: uid(), mine: false, text: `No pude responder: ${err.message}`, createdAt: Date.now() });
  }
}

/* --------------------------- Voice recording -------------------------- */
let recorder = null;
let recordChunks = [];
let recordStart = 0;
let recordTimer = null;
async function toggleRecording() {
  if (recorder && recorder.state === 'recording') { recorder.stop(); return; }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined')
    return toast('Grabación no disponible', 'Tu navegador no soporta notas de voz', 'error');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    recordChunks = []; recordStart = Date.now();
    recorder.ondataavailable = (e) => { if (e.data.size) recordChunks.push(e.data); };
    recorder.onstop = async () => {
      clearInterval(recordTimer);
      stream.getTracks().forEach((t) => t.stop());
      $('#voice-note-btn').classList.remove('recording');
      $('#composer-banner').classList.add('hidden');
      if (!recordChunks.length) return;
      const blob = new Blob(recordChunks, { type: recorder.mimeType || 'audio/webm' });
      const duration = Math.max(1, Math.round((Date.now() - recordStart) / 1000));
      const fd = new FormData();
      fd.append('file', blob, 'nota-de-voz.webm');
      fd.append('kind', 'audio');
      fd.append('duration', String(duration));
      try { const { message } = await form(`/chats/${state.activeChatId}/messages`, fd); upsertMessage(message); renderMessages(true); }
      catch (err) { toast('No se pudo enviar la nota', err.message, 'error'); }
      recorder = null;
    };
    recorder.start();
    $('#voice-note-btn').classList.add('recording');
    recordTimer = setInterval(() => {
      const s = Math.floor((Date.now() - recordStart) / 1000);
      setHTML($('#composer-banner'), `<span data-icon="mic"></span><div><strong>Grabando nota de voz…</strong><br/><span class="muted">${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} · toca el micrófono para detener</span></div>`);
      $('#composer-banner').classList.remove('hidden');
    }, 300);
  } catch { toast('Micrófono no disponible', 'Revisa los permisos del navegador', 'error'); }
}

/* ----------------------------- Emoji picker --------------------------- */
const EMOJIS = ['😀','😃','😄','😁','😅','😂','🤣','😊','😍','🥰','😘','😎','🤔','🤗','😭','😡','🥳','😴','🤯','🙌','👏','👍','👎','🙏','💪','👀','❤️','💙','💚','🔥','✨','🎉','💡','☕','🍕','🌮','🚀','🐱','🐶','🌈','⭐','💯','📌','✅','❌','⏰','🎵','📷','📎','🎁','🌻','🍀','😇','🤝','🧠','🫶','😬','🥲','🤌'];
const STICKERS = ['🥳','😂','😍','🤯','🐱','🔥','👋','💪','🎉','❤️','🚀','☕','🌈','🍀','🧠','🫶'];
const GIFS = [
  'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  'https://media.giphy.com/media/l0HlE5nOj9CcYQ5Ss/giphy.gif',
  'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
  'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
  'https://media.giphy.com/media/d2Zc5fwPf5HzZBt1e/giphy.gif',
  'https://media.giphy.com/media/12zV7uH5cXjBq/giphy.gif',
  'https://media.giphy.com/media/3o6ZsYs0N7WQ2gW9K8/giphy.gif',
  'https://media.giphy.com/media/5yLgoc7Nuy3nsPzKPo/giphy.gif',
];
let emojiTab = 'emojis';
function renderEmojiPopover() {
  const pop = $('#emoji-popover');
  let content = '';
  if (emojiTab === 'emojis') content = `<div class="emoji-grid">${EMOJIS.map((e) => `<button data-action="pick-emoji" data-emoji="${e}">${e}</button>`).join('')}</div>`;
  if (emojiTab === 'stickers') content = `<div class="sticker-grid">${STICKERS.map((e) => `<button data-action="pick-sticker" data-emoji="${e}">${e}</button>`).join('')}</div>`;
  if (emojiTab === 'gifs') content = `<div class="gif-grid">${GIFS.map((url) => `<button data-action="pick-gif" data-url="${url}"><img src="${url}" alt="GIF" loading="lazy" /></button>`).join('')}</div>
    <div class="gif-paste"><input id="gif-url" placeholder="Pega una URL de GIF…" /><button class="btn btn-primary btn-sm" data-action="paste-gif">Enviar</button></div>`;
  setHTML(pop, `<div class="emoji-tabs">
      <button data-action="emoji-tab" data-tab="emojis" class="${emojiTab === 'emojis' ? 'active' : ''}">Emojis</button>
      <button data-action="emoji-tab" data-tab="stickers" class="${emojiTab === 'stickers' ? 'active' : ''}">Stickers</button>
      <button data-action="emoji-tab" data-tab="gifs" class="${emojiTab === 'gifs' ? 'active' : ''}">GIF</button>
    </div>${content}`);
}
function toggleEmojiPopover(force) {
  const pop = $('#emoji-popover');
  const show = force ?? pop.classList.contains('hidden');
  if (show) { renderEmojiPopover(); pop.classList.remove('hidden'); } else pop.classList.add('hidden');
}
function insertIntoInput(text) {
  const input = $('#message-input');
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  input.value = input.value.slice(0, start) + text + input.value.slice(end);
  input.focus();
  input.selectionStart = input.selectionEnd = start + text.length;
}

/* ------------------------------- Modals ------------------------------- */
function openModal(title, bodyHTML, footerHTML = '', options = {}) {
  closeModal();
  const root = $('#modal-root');
  setHTML(root, `<div class="modal-overlay" data-action="overlay-close">
    <div class="modal ${options.wide ? 'wide' : ''}" role="dialog" aria-modal="true">
      <div class="modal-header"><h3>${esc(title)}</h3><button class="icon-btn" data-action="close-modal">${icon('x')}</button></div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
    </div></div>`);
  return root.querySelector('.modal');
}
function closeModal() { setHTML($('#modal-root'), ''); }

async function openNewChatModal() {
  const modal = openModal('Nueva conversación', `
    <label class="field"><span>Buscar personas</span><input id="user-search" placeholder="Nombre o correo…" autocomplete="off" /></label>
    <div id="user-list" style="margin-top:12px"><div class="chat-empty">Cargando…</div></div>`,
    `<button class="btn btn-ghost" data-action="close-modal">Cancelar</button>`);
  const renderUsers = async (search = '') => {
    try {
      const { users } = await api(`/users?search=${encodeURIComponent(search)}`);
      state.users = users;
      setHTML(modal.querySelector('#user-list'), users.length ? users.map((u) => `
        <button class="user-pick" data-action="start-direct" data-id="${u.id}">${avatarHTML(u)}<div><strong>${esc(u.name)}</strong><small>${u.online ? 'En línea' : esc(u.status || u.email)}</small></div>${icon('chevron')}</button>`).join('') : '<div class="chat-empty">No se encontraron usuarios.</div>');
    } catch (err) { toast('Error', err.message, 'error'); }
  };
  modal.querySelector('#user-search').addEventListener('input', (e) => renderUsers(e.target.value));
  renderUsers();
}

async function openNewGroupModal() {
  try {
    const { users } = await api('/users');
    state.users = users;
    const modal = openModal('Crear grupo o comunidad', `
      <div class="form-grid">
        <label class="field full"><span>Nombre del grupo</span><input id="group-name" placeholder="Ej. Viaje de verano" /></label>
        <label class="field full"><span>Descripción (opcional)</span><input id="group-desc" placeholder="¿De qué trata este grupo?" /></label>
      </div>
      <label class="field"><span>Tipo</span><select id="group-type"><option value="group">Grupo</option><option value="community">Comunidad</option></select></label>
      <div class="section-label" style="margin-top:16px">Integrantes</div>
      <div id="group-members">${users.map((u) => `<label class="checkbox-row"><input type="checkbox" value="${u.id}" />${avatarHTML(u)}<div><strong>${esc(u.name)}</strong><small>${esc(u.email)}</small></div></label>`).join('')}</div>`,
      `<button class="btn btn-ghost" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="create-group">Crear grupo</button>`);
  } catch (err) { toast('Error', err.message, 'error'); }
}

function openSettingsModal() {
  const me = state.me || {};
  const colors = ['#7c5cff', '#0aa884', '#f0647b', '#e58a2c', '#2f80ed', '#eb5757'];
  const modal = openModal('Mi perfil y ajustes', `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      ${avatarHTML(me, 'profile-avatar')}
      <div><strong style="font-size:17px">${esc(me.name)}</strong><div class="muted">${esc(me.email)}</div></div>
      <label class="btn btn-ghost btn-sm" style="margin-left:auto;cursor:pointer">Cambiar foto<input type="file" id="avatar-input" accept="image/*" class="hidden" /></label>
    </div>
    <div class="form-grid">
      <label class="field"><span>Nombre</span><input id="profile-name" value="${esc(me.name)}" /></label>
      <label class="field"><span>Estado</span><input id="profile-status" value="${esc(me.status || '')}" placeholder="Disponible" /></label>
      <label class="field full"><span>Descripción</span><textarea id="profile-desc" rows="2" maxlength="300">${esc(me.description || '')}</textarea></label>
    </div>
    <div class="field"><span>Color de perfil</span><div class="color-swatches">${colors.map((c) => `<button class="color-swatch ${me.color === c ? 'selected' : ''}" data-action="pick-color" data-color="${c}" style="background:${c}"></button>`).join('')}</div></div>
    <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" data-action="request-notifications">Activar notificaciones del navegador</button>
      <button class="btn btn-ghost btn-sm" data-action="theme">Cambiar a modo ${state.theme === 'dark' ? 'claro' : 'oscuro'}</button>
      ${me.is_admin ? '<button class="btn btn-ghost btn-sm" data-action="admin-panel">Panel de administración</button>' : ''}
    </div>
    <details style="margin-top:20px;border-top:1px solid var(--border);padding-top:16px"><summary class="muted" style="cursor:pointer">Cambiar contraseña</summary>
      <div class="form-grid" style="margin-top:12px"><label class="field"><span>Contraseña actual</span><input id="pwd-current" type="password" /></label><label class="field"><span>Nueva contraseña</span><input id="pwd-next" type="password" /></label></div>
      <button class="btn btn-ghost btn-sm" data-action="change-password">Actualizar contraseña</button>
    </details>`,
    `<button class="btn btn-ghost" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="save-profile">Guardar cambios</button>`);
  let chosenColor = me.color;
  modal.querySelectorAll('.color-swatch').forEach((b) => b.addEventListener('click', () => {
    chosenColor = b.dataset.color;
    modal.querySelectorAll('.color-swatch').forEach((x) => x.classList.toggle('selected', x === b));
  }));
  modal.dataset.chosenColor = chosenColor;
  modal.querySelector('#avatar-input').addEventListener('change', async (e) => {
    if (!e.target.files[0]) return;
    const fd = new FormData(); fd.append('avatar', e.target.files[0]);
    try { const { avatar } = await form('/me/avatar', fd); state.me.avatar = avatar; renderMyProfile(); toast('Foto actualizada'); closeModal(); openSettingsModal(); }
    catch (err) { toast('Error', err.message, 'error'); }
  });
}

async function openAdminPanel() {
  try {
    const modal = openModal('Panel de administración', '<div class="muted">Cargando…</div>', '', { wide: true });
    const { stats } = await api('/admin/overview');
    setHTML(modal.querySelector('.modal-body'), `
      <div class="admin-tabs">
        <button class="active" data-action="admin-tab" data-tab="overview">Resumen</button>
        <button data-action="admin-tab" data-tab="users">Usuarios</button>
        <button data-action="admin-tab" data-tab="broadcast">Avisos</button>
      </div><div id="admin-tab-content"></div>`);
    modal._stats = stats;
    renderAdminTab(modal, 'overview');
  } catch (err) { toast('Error', err.message, 'error'); }
}

async function renderAdminTab(modal, tab) {
  modal.querySelectorAll('.admin-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  const content = modal.querySelector('#admin-tab-content');
  if (tab === 'overview') {
    const s = modal._stats;
    setHTML(content, `<div class="stats-grid">
        <div class="stat-card"><strong>${s.users}</strong><small>Usuarios</small></div>
        <div class="stat-card"><strong>${s.chats}</strong><small>Chats</small></div>
        <div class="stat-card"><strong>${s.messages}</strong><small>Mensajes</small></div>
        <div class="stat-card"><strong>${s.stories}</strong><small>Estados</small></div>
        <div class="stat-card"><strong>${s.calls}</strong><small>Llamadas</small></div>
        <div class="stat-card"><strong>${s.banned}</strong><small>Suspendidos</small></div>
      </div><div class="muted">Base de datos SQLite activa · servidor en tiempo real conectado.</div>`);
  }
  if (tab === 'users') {
    const { users } = await api('/admin/users');
    setHTML(content, `<input id="admin-user-search" placeholder="Buscar usuario…" style="margin-bottom:12px;width:100%" />
      <table class="data-table"><thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
      ${users.map((u) => `<tr>
        <td><strong>${esc(u.name)}</strong></td><td class="muted">${esc(u.email)}</td>
        <td>${u.is_admin ? '<span class="badge">Admin</span>' : '<span class="muted">Usuario</span>'}</td>
        <td>${u.is_banned ? '<span class="badge warn">Suspendido</span>' : '<span class="badge">Activo</span>'}</td>
        <td><div class="table-actions">
          <button class="btn btn-ghost btn-sm" data-action="admin-ban" data-id="${u.id}">${u.is_banned ? 'Activar' : 'Suspender'}</button>
          <button class="btn btn-ghost btn-sm" data-action="admin-role" data-id="${u.id}">${u.is_admin ? 'Quitar admin' : 'Hacer admin'}</button>
          <button class="btn btn-ghost btn-sm" data-action="admin-delete" data-id="${u.id}" title="Eliminar">${icon('trash')}</button>
        </div></td></tr>`).join('')}
      </tbody></table>`);
    content.querySelector('#admin-user-search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      content.querySelectorAll('tbody tr').forEach((row) => { row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none'; });
    });
  }
  if (tab === 'broadcast') {
    setHTML(content, `<p class="muted">Envía una notificación a todos los usuarios registrados.</p>
      <label class="field"><span>Título</span><input id="bc-title" value="Aviso de Nexo" /></label>
      <label class="field" style="margin-top:12px"><span>Mensaje</span><textarea id="bc-body" rows="4" placeholder="Escribe el aviso…"></textarea></label>
      <button class="btn btn-primary" style="margin-top:14px" data-action="admin-broadcast">Enviar a todos</button>`);
  }
}

function openStoryModal() {
  openModal('Publicar un estado', `
    <label class="field"><span>¿Qué quieres compartir?</span><textarea id="story-text" rows="4" maxlength="500" placeholder="Escribe algo…"></textarea></label>
    <label class="btn btn-ghost btn-block" style="margin-top:12px;cursor:pointer">Adjuntar foto o video<input type="file" id="story-file" accept="image/*,video/*" class="hidden" /></label>
    <div id="story-file-name" class="muted" style="margin-top:8px;font-size:12px"></div>
    <p class="muted" style="margin-top:14px;font-size:12px">Tu estado desaparecerá automáticamente después de 24 horas.</p>`,
    `<button class="btn btn-ghost" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="publish-story">Publicar</button>`);
  $('#story-file').addEventListener('change', (e) => {
    $('#story-file-name').textContent = e.target.files[0]?.name || '';
  });
}

let storyTimer = null;
let storyIndex = 0;
let storyList = [];
function openStoryViewer(storyId) {
  storyList = [...state.stories];
  storyIndex = Math.max(0, storyList.findIndex((s) => s.id === storyId));
  showCurrentStory();
}
function showCurrentStory() {
  clearTimeout(storyTimer);
  const story = storyList[storyIndex];
  if (!story) return closeStoryViewer();
  api(`/stories/${story.id}/view`, { method: 'POST' }).catch(() => {});
  story.viewed = true;
  const root = $('#modal-root');
  setHTML(root, `<div class="story-overlay">
    <div class="story-card">
      ${story.kind === 'text'
        ? `<div class="story-text-bg">${esc(story.text)}</div>`
        : story.kind === 'video'
          ? `<video class="story-media" src="${esc(story.fileUrl)}" autoplay muted playsinline loop></video>`
          : `<img class="story-media" src="${esc(story.fileUrl)}" alt="Estado" />`}
      <div class="story-top">
        <div class="story-progress">${storyList.map((_, i) => `<i class="${i < storyIndex ? 'done' : i === storyIndex ? 'active' : ''}"></i>`).join('')}</div>
        <div class="story-author">${avatarHTML(story.author)}<div><strong>${esc(story.author.name)}</strong><small>${relativeTime(story.createdAt)}</small></div></div>
      </div>
      ${story.kind !== 'text' && story.text ? `<div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;color:#fff;padding:20px;text-shadow:0 2px 8px #000;font-size:19px;font-weight:700">${esc(story.text)}</div>` : ''}
      <button class="story-close" data-action="close-modal">${icon('x')}</button>
      ${storyIndex > 0 ? `<button class="story-nav prev" data-action="story-prev">${icon('chevron')}</button>` : ''}
      ${storyIndex < storyList.length - 1 ? `<button class="story-nav next" data-action="story-next">${icon('chevron')}</button>` : ''}
      ${story.mine ? `<button class="story-delete" data-action="story-delete" data-id="${story.id}">Eliminar estado</button>` : ''}
    </div></div>`);
  hydrateIcons(root.querySelector('.story-nav.prev') || root);
  const prev = root.querySelector('.story-nav.prev'); if (prev) prev.style.transform = 'rotate(180deg)';
  renderStories();
  storyTimer = setTimeout(() => { storyIndex++; showCurrentStory(); }, 5000);
}
function closeStoryViewer() { clearTimeout(storyTimer); closeModal(); }

/* ----------------------- Calls (WebRTC + socket) ---------------------- */
class CallManager {
  constructor() { this.active = null; this.incoming = null; this.queued = []; this.candidates = []; this.timer = null; this.muted = false; this.cameraOff = false; }
  get socket() { return state.socket; }

  render() {
    const root = $('#call-root');
    if (!this.active && !this.incoming) { setHTML(root, ''); return; }
    const inc = !this.active && this.incoming;
    const c = this.active || this.incoming;
    const kind = c.kind || 'voice';
    const name = inc ? (c.from?.name || 'Usuario') : c.name;
    const status = inc ? 'Llamada entrante…' : (c.status || 'Llamando…');
    setHTML(root, `<div class="call-overlay ${kind === 'voice' ? 'audio-only' : ''}">
      <video id="remote-video" class="remote-video" autoplay playsinline></video>
      <div class="call-bg-glow"></div>
      <div class="call-center">
        <div class="avatar" style="background:linear-gradient(135deg,var(--violet),var(--accent))">${esc(initials(name))}</div>
        <h2>${esc(name)}</h2>
        <p id="call-status">${esc(status)}</p>
        <p class="call-timer muted" id="call-timer"></p>
      </div>
      <video id="local-video" class="local-video" autoplay playsinline muted></video>
      <div class="call-controls">
        ${inc ? `
          <button class="call-control-btn" data-action="call-decline" title="Rechazar">${icon('phone-off')}</button>
          <button class="call-control-btn" style="background:#1cc19a;color:#062" data-action="call-accept" title="Aceptar">${icon('phone')}</button>
        ` : `
          <button class="call-control-btn ${this.muted ? 'active' : ''}" data-action="call-mute" title="Silenciar">${icon(this.muted ? 'mic-off' : 'mic')}</button>
          ${kind === 'video' ? `<button class="call-control-btn ${this.cameraOff ? 'active' : ''}" data-action="call-camera" title="Cámara">${icon(this.cameraOff ? 'video-off' : 'video')}</button>` : ''}
          <button class="call-control-btn hangup" data-action="call-hangup" title="Colgar">${icon('phone-off')}</button>
        `}
      </div>
    </div>`);
    this.attachStreams();
    if (this.active) this.startTimer();
  }

  attachStreams() {
    if (!this.active) return;
    const remote = $('#remote-video');
    if (remote && this.active.remoteStream) { remote.srcObject = this.active.remoteStream; remote.play().catch(() => {}); }
    const local = $('#local-video');
    if (local && this.active.localStream) { local.srcObject = this.active.localStream; local.play().catch(() => {}); }
  }

  async start(kind, calleeId, chatId, name) {
    if (this.active || this.incoming) return toast('Ya hay una llamada en curso', '', 'error');
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: kind === 'video' }); }
    catch { return toast('No se pudo acceder a cámara o micrófono', 'Revisa los permisos del navegador', 'error'); }
    const res = await new Promise((resolve) => this.socket.emit('call:invite', { calleeId, chatId, kind }, resolve));
    if (!res?.ok) {
      stream.getTracks().forEach((t) => t.stop());
      return toast('Llamada no disponible', res?.error || 'Inténtalo de nuevo', 'error');
    }
    this.active = { callId: res.callId, role: 'caller', kind, otherId: calleeId, name, localStream: stream, status: 'Llamando…' };
    this.muted = false; this.cameraOff = false;
    this.setupPeer();
    try {
      const offer = await this.active.peer.createOffer();
      await this.active.peer.setLocalDescription(offer);
      this.signal({ description: this.active.peer.localDescription });
    } catch (err) { console.error(err); }
    this.render();
  }

  setupPeer() {
    const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    this.active.peer = peer;
    this.active.remoteStream = new MediaStream();
    this.candidates = [];
    this.active.localStream.getTracks().forEach((track) => peer.addTrack(track, this.active.localStream));
    peer.onicecandidate = (e) => { if (e.candidate) this.signal({ candidate: e.candidate }); };
    peer.ontrack = (e) => { if (this.active) { this.active.remoteStream.addTrack(e.track); this.attachStreams(); } };
    peer.onconnectionstatechange = () => {
      if (!this.active) return;
      if (peer.connectionState === 'connected') { this.active.status = 'En llamada'; this.updateStatus(); }
      if (peer.connectionState === 'failed') this.end('Se perdió la conexión de la llamada');
    };
    const queued = this.queued.filter((s) => s.callId === this.active.callId);
    this.queued = this.queued.filter((s) => s.callId !== this.active.callId);
    queued.forEach((s) => this.applySignal(s.data));
  }

  signal(data) {
    if (!this.active || !this.socket) return;
    this.socket.emit('call:signal', { callId: this.active.callId, to: this.active.otherId, data });
  }

  async handleSignal({ callId, data }) {
    if (this.active?.callId === callId) return this.applySignal(data);
    // Señales que llegan antes de aceptar la llamada: se aplican al crear el peer.
    this.queued.push({ callId, data });
  }

  async applySignal(data) {
    const peer = this.active?.peer;
    if (!peer) return;
    try {
      if (data.description) {
        await peer.setRemoteDescription(data.description);
        if (data.description.type === 'offer') {
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          this.signal({ description: peer.localDescription });
          this.active.status = 'Conectando…'; this.updateStatus();
        }
        for (const c of this.candidates) { try { await peer.addIceCandidate(c); } catch { /* ignore */ } }
        this.candidates = [];
      } else if (data.candidate) {
        if (peer.remoteDescription) await peer.addIceCandidate(data.candidate);
        else this.candidates.push(data.candidate);
      }
    } catch (err) { console.error('[call] signal', err); }
  }

  incomingCall(payload) {
    if (this.active) return this.socket.emit('call:answer', { callId: payload.callId, accepted: false });
    this.incoming = payload;
    this.render();
  }

  async accept() {
    const inc = this.incoming;
    if (!inc) return;
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: inc.kind === 'video' }); }
    catch { return toast('No se pudo acceder a cámara o micrófono', 'Revisa los permisos', 'error'); }
    this.incoming = null;
    this.active = { callId: inc.callId, role: 'callee', kind: inc.kind, otherId: inc.from.id, name: inc.from.name, localStream: stream, status: 'Conectando…' };
    this.muted = false; this.cameraOff = false;
    this.socket.emit('call:answer', { callId: inc.callId, accepted: true });
    this.setupPeer(); this.render();
  }

  decline() {
    if (!this.incoming) return;
    this.socket.emit('call:answer', { callId: this.incoming.callId, accepted: false });
    this.incoming = null; this.render();
  }

  onAnswered() {
    if (!this.active) return;
    this.active.status = 'Conectando…'; this.updateStatus();
  }

  remoteEnd() { if (this.active || this.incoming) { this.cleanup(); toast('La llamada ha terminado'); } }

  toggleMute() {
    if (!this.active?.localStream) return;
    this.muted = !this.muted;
    this.active.localStream.getAudioTracks().forEach((t) => { t.enabled = !this.muted; });
    this.render();
  }

  toggleCamera() {
    if (!this.active?.localStream) return;
    this.cameraOff = !this.cameraOff;
    this.active.localStream.getVideoTracks().forEach((t) => { t.enabled = !this.cameraOff; });
    this.render();
  }

  end(message) {
    if (this.active) {
      this.socket.emit('call:end', { callId: this.active.callId, to: this.active.otherId });
      this.cleanup();
      if (message) toast(message);
    } else this.decline();
  }

  cleanup() {
    clearInterval(this.timer);
    if (this.active?.localStream) this.active.localStream.getTracks().forEach((t) => t.stop());
    try { this.active?.peer?.close(); } catch { /* ignore */ }
    this.active = null; this.incoming = null; this.queued = []; this.candidates = [];
    if ($('#call-root')) setHTML($('#call-root'), '');
  }

  updateStatus() { const el = $('#call-status'); if (el && this.active) el.textContent = this.active.status; }

  startTimer() {
    clearInterval(this.timer);
    const start = Date.now();
    this.timer = setInterval(() => {
      const el = $('#call-timer');
      if (!el || !this.active) return clearInterval(this.timer);
      const s = Math.floor((Date.now() - start) / 1000);
      el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    }, 1000);
  }
}

call = new CallManager();

/* --------------------------- Details panel ---------------------------- */
function openDetails(mode = 'info', query = '') {
  state.detailsMode = mode;
  $('#details-panel').classList.remove('hidden');
  renderDetails(query);
}
function closeDetails() {
  state.detailsMode = null;
  $('#details-panel').classList.add('hidden');
}
async function renderDetails(query = '') {
  const panel = $('#details-panel');
  if (state.detailsMode === 'notifications') {
    setHTML(panel, `<div class="details-header">Notificaciones<button class="icon-btn" data-action="close-details">${icon('x')}</button></div>
      <div class="details-body"><button class="text-btn" data-action="read-notifications" style="margin-bottom:12px">Marcar todo como leído</button>
      <div id="notif-list">${state.notifications.length ? state.notifications.map((n) => `
        <div class="notification-row ${n.read ? '' : 'unread'}"><span data-icon="bell"></span><div><strong>${esc(n.title)}</strong><small>${esc(n.body)}</small><br/><small>${relativeTime(n.createdAt)}</small></div></div>`).join('') : '<div class="chat-empty">Sin notificaciones</div>'}</div></div>`);
    return;
  }
  if (state.detailsMode === 'search') {
    setHTML(panel, `<div class="details-header">Buscar mensajes<button class="icon-btn" data-action="close-details">${icon('x')}</button></div>
      <div class="details-body"><label class="field"><span>Buscar en todos los chats</span><input id="details-search" value="${esc(query)}" placeholder="Palabra o frase…" /></label>
      <div id="search-results" style="margin-top:14px"></div></div>`);
    const input = panel.querySelector('#details-search');
    input.focus();
    input.addEventListener('input', debounce(async (e) => {
      const q = e.target.value.trim();
      if (q.length < 2) return setHTML(panel.querySelector('#search-results'), '');
      try {
        const { messages } = await api(`/search?q=${encodeURIComponent(q)}`);
        setHTML(panel.querySelector('#search-results'), messages.length ? messages.map((m) => `
          <button class="search-result" data-action="jump-message" data-id="${m.id}" data-chat="${m.chatId}">
            <strong>${esc(m.sender?.name || 'Usuario')} · ${esc(state.chats.find((c) => c.id === m.chatId)?.name || 'Chat')}</strong>
            <span>${esc(m.text || m.kind)}</span><small>${fmtDay(m.createdAt)} · ${fmtTime(m.createdAt)}</small>
          </button>`).join('') : '<div class="chat-empty">Sin resultados</div>');
      } catch (err) { toast('Error en la búsqueda', err.message, 'error'); }
    }, 300));
    if (query.length >= 2) input.dispatchEvent(new Event('input'));
    return;
  }
  const chat = state.activeChat;
  if (!chat) return;
  const media = state.messages.filter((m) => m.kind === 'image' || m.kind === 'video' || m.kind === 'gif');
  setHTML(panel, `<div class="details-header">Información<button class="icon-btn" data-action="close-details">${icon('x')}</button></div>
    <div class="details-body">
      <div class="profile-card">${chat.type === 'ai' ? '<span class="avatar" style="background:linear-gradient(135deg,#7c5cff,#0aa884);font-size:30px">✦</span>' : avatarHTML({ avatar: chat.avatar, color: chat.color, name: chat.name })}
        <strong>${esc(chat.name)}</strong><small>${chat.type === 'direct' ? 'Chat privado' : chat.type === 'ai' ? 'Asistente IA' : `${chat.type === 'community' ? 'Comunidad' : 'Grupo'} · ${chat.members?.length || 0} integrantes`}</small>
        <p class="muted">${esc(chat.description || '')}</p></div>
      ${chat.members?.length ? `<div class="panel-section"><h4>Integrantes</h4>${chat.members.map((m) => `<div class="member-row">${avatarHTML(m)}<div><strong>${esc(m.name)}</strong><small>${m.online ? 'En línea' : (m.status || m.role)}</small></div>${m.role === 'admin' ? '<span class="badge">Admin</span>' : ''}</div>`).join('')}</div>` : ''}
      ${media.length ? `<div class="panel-section"><h4>Fotos y videos</h4><div class="media-grid">${media.map((m) => m.kind === 'video' ? `<video src="${esc(m.fileUrl)}" data-action="open-image" data-id="${m.id}"></video>` : `<img src="${esc(m.fileUrl || m.text)}" data-action="open-image" data-id="${m.id}" loading="lazy" />`).join('')}</div></div>` : ''}
      <button class="btn btn-ghost btn-block btn-sm" data-action="chat-search">Buscar en este chat</button>
    </div>`);
}

function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }

/* ------------------------- Global click handler ----------------------- */
function bindGlobalEvents() {
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) {
      if (!e.target.closest('#emoji-popover') && !e.target.closest('[data-action="toggle-emoji"]')) $('#emoji-popover').classList.add('hidden');
      return;
    }
    const action = target.dataset.action;
    const id = target.dataset.id;
    try {
      switch (action) {
        /* auth */
        case 'auth-tab': setAuthMode(target.dataset.mode); break;
        case 'demo-login': {
          authMode = 'login';
          $('#auth-email').value = target.dataset.email;
          $('#auth-password').value = '123456';
          await submitAuth(target.dataset.email, '123456');
          break;
        }
        /* navigation */
        case 'select-chat': await selectChat(id); break;
        case 'close-chat': closeChat(); break;
        case 'new-chat': openNewChatModal(); break;
        case 'new-group': openNewGroupModal(); break;
        case 'start-direct': {
          const { chat } = await json('POST', '/chats', { type: 'direct', memberIds: [id] });
          closeModal(); await loadChats(); await selectChat(chat.id);
          break;
        }
        case 'create-group': {
          const name = $('#group-name').value.trim();
          const memberIds = [...document.querySelectorAll('#group-members input:checked')].map((i) => i.value);
          if (!name) return toast('Falta el nombre', 'Ponle un nombre al grupo', 'error');
          const { chat } = await json('POST', '/chats', { type: $('#group-type').value, name, description: $('#group-desc').value, memberIds });
          closeModal(); await loadChats(); await selectChat(chat.id);
          break;
        }
        case 'ai-chat': await selectChat('ai'); break;
        case 'logout': doLogout(); break;
        case 'theme': {
          state.theme = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.dataset.theme = state.theme;
          localStorage.setItem('nexo-theme', state.theme);
          if ($('#modal-root .modal')) { closeModal(); openSettingsModal(); }
          break;
        }
        /* composer */
        case 'send-message': sendMessage(); break;
        case 'attach-file': $('#file-input').click(); break;
        case 'toggle-emoji': toggleEmojiPopover(); break;
        case 'emoji-tab': emojiTab = target.dataset.tab; renderEmojiPopover(); break;
        case 'pick-emoji': insertIntoInput(target.dataset.emoji); break;
        case 'pick-sticker': toggleEmojiPopover(false); sendCustom('sticker', target.dataset.emoji); break;
        case 'pick-gif': toggleEmojiPopover(false); sendCustom('gif', target.dataset.url); break;
        case 'paste-gif': {
          const url = $('#gif-url').value.trim();
          if (!/^https?:\/\//.test(url)) return toast('URL inválida', 'Pega una URL de GIF', 'error');
          toggleEmojiPopover(false); sendCustom('gif', url); break;
        }
        case 'voice-note': toggleRecording(); break;
        case 'cancel-compose': state.replyTo = null; state.editingId = null; $('#message-input').value = ''; renderComposerBanner(); break;
        /* messages */
        case 'msg-reply': {
          const m = state.messages.find((x) => x.id === id);
          if (m) { state.replyTo = m; state.editingId = null; renderComposerBanner(); $('#message-input').focus(); }
          break;
        }
        case 'msg-edit': {
          const m = state.messages.find((x) => x.id === id);
          if (m) { state.editingId = id; state.replyTo = null; $('#message-input').value = m.text; renderComposerBanner(); $('#message-input').focus(); }
          break;
        }
        case 'msg-delete': {
          if (!confirm('¿Eliminar este mensaje?')) break;
          await api(`/messages/${id}`, { method: 'DELETE' });
          const m = state.messages.find((x) => x.id === id);
          if (m) { m.deleted = true; m.text = ''; m.fileUrl = ''; renderMessages(); }
          break;
        }
        case 'msg-react': case 'react': {
          const emoji = target.dataset.emoji || '👍';
          const { reactions } = await json('POST', `/messages/${id}/react`, { emoji });
          const m = state.messages.find((x) => x.id === id);
          if (m) { m.reactions = reactions; renderMessages(); }
          break;
        }
        case 'play-audio': {
          const audio = document.getElementById(`audio-${id}`);
          if (audio) { audio.paused ? audio.play().catch(() => {}) : audio.pause(); }
          break;
        }
        case 'open-image': {
          const m = state.messages.find((x) => x.id === id);
          if (!m) break;
          openModal('Vista previa', `<div style="text-align:center;background:#000;border-radius:12px;overflow:hidden">
            ${m.kind === 'video' ? `<video src="${esc(m.fileUrl)}" controls style="max-height:65vh;max-width:100%"></video>` : `<img src="${esc(m.fileUrl || m.text)}" style="max-height:65vh;max-width:100%" alt="Vista previa" />`}</div>`);
          break;
        }
        /* details */
        case 'open-details': openDetails('info'); break;
        case 'close-details': closeDetails(); break;
        case 'chat-search': openDetails('search'); break;
        case 'notifications': openDetails('notifications'); break;
        case 'read-notifications': await json('POST', '/notifications/read', {}); state.notifications.forEach((n) => { n.read = true; }); renderNotificationsBadge(); renderDetails(); break;
        case 'clear-chat-search': $('#chat-search').value = ''; state.chatFilter = ''; state.searchResults = []; renderChatList(); target.classList.add('hidden'); break;
        case 'jump-message': {
          if (state.activeChatId !== target.dataset.chat) await selectChat(target.dataset.chat);
          renderMessages();
          setTimeout(() => { const el = document.querySelector(`[data-message-id="${CSS.escape(id)}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('message-highlight'); } }, 150);
          break;
        }
        /* profile */
        case 'settings': openSettingsModal(); break;
        case 'save-profile': {
          const modal = $('#modal-root .modal');
          await json('PUT', '/me', {
            name: $('#profile-name').value, status: $('#profile-status').value,
            description: $('#profile-desc').value, color: modal?.dataset.chosenColor || state.me.color,
          }).then(({ user }) => { state.me = user; });
          renderMyProfile(); closeModal(); toast('Perfil actualizado');
          break;
        }
        case 'change-password': {
          await json('POST', '/me/password', { current: $('#pwd-current').value, next: $('#pwd-next').value });
          toast('Contraseña actualizada'); $('#pwd-current').value = ''; $('#pwd-next').value = '';
          break;
        }
        case 'request-notifications': {
          if (!('Notification' in window)) return toast('No disponible', 'Tu navegador no admite notificaciones', 'error');
          const permission = await Notification.requestPermission();
          toast(permission === 'granted' ? 'Notificaciones activadas' : 'Notificaciones desactivadas');
          break;
        }
        /* stories */
        case 'create-story': openStoryModal(); break;
        case 'view-story': openStoryViewer(id); break;
        case 'story-prev': storyIndex = Math.max(0, storyIndex - 1); showCurrentStory(); break;
        case 'story-next': storyIndex = Math.min(storyList.length - 1, storyIndex + 1); showCurrentStory(); break;
        case 'publish-story': {
          const fd = new FormData();
          fd.append('text', $('#story-text').value);
          fd.append('kind', $('#story-file').files[0] ? ($('#story-file').files[0].type.startsWith('video/') ? 'video' : 'image') : 'text');
          if ($('#story-file').files[0]) fd.append('file', $('#story-file').files[0]);
          await form('/stories', fd); closeModal(); await loadStories(); renderStories(); toast('Estado publicado', 'Desaparecerá en 24 horas');
          break;
        }
        case 'story-delete': await api(`/stories/${id}`, { method: 'DELETE' }); closeStoryViewer(); await loadStories(); renderStories(); break;
        /* calls */
        case 'call-voice': case 'call-video': {
          const kind = action === 'call-video' ? 'video' : 'voice';
          const members = (state.activeChat?.members || []).filter((m) => m.id !== state.me.id);
          if (!members.length) return toast('No hay nadie a quien llamar', '', 'error');
          if (members.length > 1) {
            openModal('Iniciar llamada', `<p class="muted">Elige con quién quieres hablar.</p>${members.map((m) => `
              <button class="user-pick" data-action="start-call" data-id="${m.id}" data-name="${esc(m.name)}" data-kind="${kind}">
                ${avatarHTML(m)}<div><strong>${esc(m.name)}</strong><small>${m.online ? 'En línea' : 'Desconectado'}</small></div>${icon('phone')}
              </button>`).join('')}`);
          } else call.start(kind, members[0].id, state.activeChat.id, members[0].name);
          break;
        }
        case 'start-call': closeModal(); call.start(target.dataset.kind, id, state.activeChat.id, target.dataset.name); break;
        case 'call-accept': call.accept(); break;
        case 'call-decline': case 'call-hangup': call.end(); break;
        case 'call-mute': call.toggleMute(); break;
        case 'call-camera': call.toggleCamera(); break;
        /* admin */
        case 'admin-panel': closeModal(); openAdminPanel(); break;
        case 'admin-tab': renderAdminTab($('#modal-root .modal'), target.dataset.tab); break;
        case 'admin-ban': await json('POST', `/admin/users/${id}/ban`, {}); renderAdminTab($('#modal-root .modal'), 'users'); toast('Estado del usuario actualizado'); break;
        case 'admin-role': await json('POST', `/admin/users/${id}/admin`, {}); renderAdminTab($('#modal-root .modal'), 'users'); toast('Rol actualizado'); break;
        case 'admin-delete': if (confirm('¿Eliminar permanentemente este usuario?')) { await api(`/admin/users/${id}`, { method: 'DELETE' }); renderAdminTab($('#modal-root .modal'), 'users'); toast('Usuario eliminado'); } break;
        case 'admin-broadcast': {
          const { sent } = await json('POST', '/admin/broadcast', { title: $('#bc-title').value, body: $('#bc-body').value });
          toast('Aviso enviado', `Notificados ${sent} usuarios`); $('#bc-body').value = '';
          break;
        }
        /* modal */
        case 'close-modal': target.closest('.modal-overlay') ? closeModal() : closeStoryViewer(); break;
        case 'overlay-close': if (e.target === target) closeModal(); break;
        case 'dismiss-toast': target.closest('.toast')?.remove(); break;
      }
    } catch (err) {
      console.error(err);
      toast('Algo salió mal', err.message, 'error');
    }
  });

  $('#auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    submitAuth($('#auth-email').value.trim(), $('#auth-password').value, $('#reg-name')?.value.trim(), $('#auth-form [name="description"]')?.value || '');
  });

  $('#message-input').addEventListener('input', (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`;
    if (state.activeChatId && state.activeChatId !== 'ai' && state.socket) {
      state.socket.emit('typing', { chatId: state.activeChatId, typing: true });
      clearTimeout(window.__typingTimer);
      window.__typingTimer = setTimeout(() => state.socket?.emit('typing', { chatId: state.activeChatId, typing: false }), 1600);
    }
  });
  $('#message-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  $('#file-input').addEventListener('change', async (e) => {
    await sendFiles([...e.target.files]);
    e.target.value = '';
  });
  $('#chat-search').addEventListener('input', debounce(async (e) => {
    state.chatFilter = e.target.value;
    $('#clear-chat-search').classList.toggle('hidden', !state.chatFilter);
    if (state.chatFilter.length >= 2) {
      try { const { messages } = await api(`/search?q=${encodeURIComponent(state.chatFilter)}`); state.searchResults = messages; } catch { state.searchResults = []; }
    } else state.searchResults = [];
    renderChatList();
  }, 300));
  window.addEventListener('beforeunload', () => state.socket?.disconnect());
}

async function doLogout() {
  call.cleanup();
  try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  if (state.socket) { state.socket.disconnect(); state.socket = null; }
  Object.assign(state, { me: null, chats: [], messages: [], activeChat: null, activeChatId: null, stories: [], notifications: [], detailsMode: null });
  $('#app-view').classList.add('hidden');
  $('#auth-view').classList.remove('hidden');
  $('#modal-root').innerHTML = '';
  document.querySelector('.icon-actions [data-action="admin-panel"]')?.remove();
  setAuthMode('login');
}

/* -------------------------------- Go ---------------------------------- */
boot();
