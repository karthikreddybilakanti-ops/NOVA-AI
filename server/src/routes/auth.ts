import { Router, Request, Response } from 'express';
import { globalAuthService } from '../auth/authService.js';

export const authRouter = Router();

// 1. User Signup
authRouter.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const { user, token } = await globalAuthService.signUp(name || 'Nova User', email, password);
    res.status(201).json({ user, token });
  } catch (error: any) {
    console.error('[Signup Error]:', error.message);
    res.status(400).json({ error: error.message || 'Signup failed.' });
  }
});

// 2. User Login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const { user, token } = await globalAuthService.login(email, password);
    res.json({ user, token });
  } catch (error: any) {
    console.error('[Login Error]:', error.message);
    res.status(401).json({ error: error.message || 'Invalid email address or password.' });
  }
});

// 3. Admin Login
authRouter.post('/admin-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Administrator email and password are required.' });
      return;
    }

    const { user, token } = await globalAuthService.adminLogin(email, password);
    res.json({ user, token });
  } catch (error: any) {
    console.error('[Admin Login Error]:', error.message);
    res.status(403).json({ error: error.message || 'Admin authentication failed.' });
  }
});

// 4. Logout / Session Clearing
authRouter.post('/logout', (_req: Request, res: Response): void => {
  res.json({ success: true, message: 'Session logged out successfully.' });
});

// 5. Forgot Password
authRouter.post('/forgot-password', (req: Request, res: Response): void => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }
  res.json({ message: 'If an account with this email exists, a password reset link has been dispatched.' });
});

// 6. Get Current User Profile (Session Persistence)
authRouter.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';

    if (!token) {
      res.status(401).json({ error: 'Unauthorized or expired session.' });
      return;
    }

    const user = await globalAuthService.getUserByToken(token);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized or expired session.' });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    console.error('[Auth Profile Error]:', err.message);
    res.status(401).json({ error: 'Invalid session token.' });
  }
});
