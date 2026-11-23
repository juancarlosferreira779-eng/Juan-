# Nexo Chat

Aplicación de mensajería en tiempo real completa, construida con **Node.js + Express + Socket.IO + SQLite** y un cliente web sin build step. Todo corre en un solo servidor y los datos persisten en disco.

## Funcionalidades

| Función | Implementación |
| --- | --- |
| Registro e inicio de sesión | Contraseñas con `scrypt`, sesiones en SQLite y cookie `HttpOnly`. |
| Perfil | Foto, nombre, estado, descripción, color y cambio de contraseña. |
| Chats privados | Chats 1:1 en tiempo real con presencia y estados de lectura. |
| Enviar y recibir mensajes | Socket.IO + REST, indicador de escritura, respuestas y reacciones. |
| Editar y eliminar mensajes | Solo el autor (o admin de grupo para eliminar), con confirmación y indicador de *editado*. |
| Fotos, videos y documentos | Subida de archivos (hasta 30 MB), galería en el panel lateral y descarga. |
| Audios y notas de voz | Grabación con `MediaRecorder` y reproductor inline. |
| Grupos y comunidades | Creación de grupos/comunidades, integrantes y roles. |
| Llamadas y videollamadas | WebRTC peer-to-peer con señalización por Socket.IO. |
| Estados de 24 h | Publicación de texto/imagen/video, expiración automática y visualización con barra de progreso. |
| Emojis, stickers y GIF | Selector integrado + pegado de URLs de GIF. |
| Buscador de mensajes | Búsqueda global y por chat con salto al mensaje. |
| Modo oscuro y claro | Persistido en `localStorage`. |
| Inteligencia artificial | Asistente «Nexo IA» con respuestas locales y soporte opcional para API compatible con OpenAI. |
| Notificaciones | In-app en tiempo real + notificaciones del navegador (con permiso). |
| Panel de administración | Métricas, usuarios, suspensiones, roles, eliminación y avisos masivos. |
| Servidor y base de datos | Express + SQLite (`node:sqlite`) con WAL; `data/chat.db` y `data/uploads/`. |

## Ejecutar

Requiere **Node.js 22.5+** (usa el módulo nativo `node:sqlite`, sin dependencias nativas extra).

```bash
npm install
npm start
```

Abre `http://localhost:3000`. El servidor escucha en `0.0.0.0`, así que también funciona detrás del preview proxy.

### Cuentas demo

Contraseña para todas: **`123456`**

| Correo | Usuario | Rol |
| --- | --- | --- |
| `ana@demo.com` | Ana Torres | Usuario |
| `luis@demo.com` | Luis Ramírez | Usuario |
| `marta@demo.com` | Marta Sosa | Usuario |
| `admin@demo.com` | Sofía | Administrador |

La base de datos se siembra automáticamente la primera vez. Para empezar vacía: `SEED_DEMO=0 npm start`. Para regenerar los datos de demo, borra el directorio `data/` y reinicia.

## Configuración opcional

```bash
# Asistente IA con un proveedor compatible con OpenAI (si no se define, usa el modo local)
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

PORT=3000
```

## Estructura

```
server/
  db.js         # esquema SQLite, hash de contraseñas y datos demo
  auth.js       # sesiones y middlewares
  helpers.js    # serialización de chats/mensajes/estados, notificaciones
  routes.js     # API REST
  realtime.js   # Socket.IO: presencia, typing y señalización de llamadas
  ai.js         # asistente local / proveedor OpenAI
  index.js      # servidor HTTP
public/
  index.html
  styles.css
  js/app.js     # SPA completa (UI, interacciones y WebRTC)
data/           # SQLite + archivos subidos (ignorado por Git)
```

## Notas de producción

- Las llamadas WebRTC son peer-to-peer: en redes restrictivas necesitas un servidor **TURN** (el STUN de Google está configurado por defecto).
- La app está pensada como demo autocontenida. Para producción, añade HTTPS, `secure: true` en la cookie, rate limiting y backups de `data/chat.db`.
- Los GIF del selector se cargan desde la CDN de Giphy; también puedes pegar cualquier URL HTTPS de GIF.
