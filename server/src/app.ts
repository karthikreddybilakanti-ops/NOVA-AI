import express, { Express, Request, Response, NextFunction } from 'express';
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

export function createApp(): Express {
  const app = express();

  // CORS Middleware - allow cross-origin requests from Vercel deployments & localhost
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Healthcheck Endpoints
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Mount API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/feedback', feedbackRouter);

  // Global Error Handler for API routes
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Global Server Error]:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'File size exceeds maximum allowed limit (15MB).' });
      return;
    }
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error processing request.',
    });
  });

  // Serve static client build if dist folder exists (in local / production mode)
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      // Do not rewrite /api requests to index.html
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  return app;
}

export const app = createApp();
export default app;
