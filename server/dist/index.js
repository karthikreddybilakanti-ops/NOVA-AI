import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import { adminRouter } from './routes/admin.js';
import { feedbackRouter } from './routes/feedback.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: '10mb' }));
// Healthcheck
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', product: 'NOVA AI', timestamp: new Date().toISOString() });
});
// Mounted API Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);
app.use('/api/feedback', feedbackRouter);
// Serve static client build if dist folder exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
}
// Start server
app.listen(PORT, () => {
    console.log(`\n🚀  NOVA AI Backend running on http://localhost:${PORT}`);
    console.log(`📡 Core API Endpoints:`);
    console.log(`   - Auth:   POST /api/auth/login, /signup, /admin-login`);
    console.log(`   - Chat:   POST /api/chat/message, GET /models, /conversations`);
    console.log(`   - Admin:  GET  /api/admin/metrics, /traces, /stream (SSE)\n`);
});
