import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀  NOVA AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 Core API Endpoints:`);
  console.log(`   - Auth:   POST /api/auth/login, /signup, /admin-login`);
  console.log(`   - Chat:   POST /api/chat/message, GET /models, /conversations`);
  console.log(`   - Admin:  GET  /api/admin/metrics, /traces, /stream (SSE)\n`);
});
