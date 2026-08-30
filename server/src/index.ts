import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀  NOVA AI Backend running on port ${PORT} (bound to 0.0.0.0)`);
  console.log(`📡 Core API Endpoints:`);
  console.log(`   - Auth:   POST /api/auth/login, /signup, /admin-login`);
  console.log(`   - Chat:   POST /api/chat/message, GET /models, /conversations`);
  console.log(`   - Admin:  GET  /api/admin/metrics, /traces, /stream (SSE)\n`);
});
