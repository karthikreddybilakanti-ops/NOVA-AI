import { Router, Request, Response } from 'express';
import { globalAuthStore } from '../auth/authStore.js';
import { supabase } from '../supabase.js';

export const authRouter = Router();

// 1. User Signup
authRouter.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    // Register user in store
    const { user, token } = globalAuthStore.register(name || 'Nova User', cleanEmail, password);

    // Optional Supabase Auth synchronization if Supabase is configured
    if (supabase) {
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { name: user.name, role: user.role },
          },
        });
      } catch (sbErr: any) {
        console.warn('[Supabase Sync Warning]:', sbErr.message);
      }
    }

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

    const cleanEmail = email.toLowerCase().trim();
    const { user, token } = globalAuthStore.login(cleanEmail, password);

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

    const cleanEmail = email.toLowerCase().trim();
    const { user, token } = globalAuthStore.adminLogin(cleanEmail, password);

    res.json({ user, token });
  } catch (error: any) {
    console.error('[Admin Login Error]:', error.message);
    res.status(403).json({ error: error.message || 'Admin authentication failed.' });
  }
});

// 4. Forgot Password
authRouter.post('/forgot-password', (req: Request, res: Response): void => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }
  res.json({ message: 'If an account with this email exists, a password reset link has been dispatched.' });
});

// 5. Get Current User Profile
authRouter.get('/me', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';

  const user = globalAuthStore.getUserByToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized or expired session.' });
    return;
  }

  res.json({ user });
});
