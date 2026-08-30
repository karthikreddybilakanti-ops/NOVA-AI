import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

process.on('uncaughtException', (err) => {
  console.error('[Process Uncaught Exception]:', err.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Process Unhandled Rejection]:', reason);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀  NOVA AI Backend running on port ${PORT} (bound to 0.0.0.0)`);
  console.log(`📡 Core API Endpoints:`);
  console.log(`   - Auth:   POST /api/auth/login, /signup, /admin-login`);
  console.log(`   - Chat:   POST /api/chat/message, GET /models, /conversations`);
  console.log(`   - Admin:  GET  /api/admin/metrics, /traces, /stream (SSE)\n`);
});

server.on('error', (err: any) => {
  console.error('[Server Listener Error]:', err.message || err);
});
