import { Router, Request, Response } from 'express';
import { globalAuthStore } from '../auth/authStore.js';

export const authRouter = Router();

// Signup
authRouter.post('/signup', (req: Request, res: Response): void => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const { user, token } = globalAuthStore.register(name || 'Nova User', email, password);
    res.json({ user, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed.' });
  }
});

// User Login
authRouter.post('/login', (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const { user, token } = globalAuthStore.login(email, password);
    res.json({ user, token });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Invalid credentials.' });
  }
});

// Admin Login
authRouter.post('/admin-login', (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const { user, token } = globalAuthStore.adminLogin(email, password);
    res.json({ user, token });
  } catch (error: any) {
    res.status(403).json({ error: error.message || 'Access denied.' });
  }
});

// Forgot Password
authRouter.post('/forgot-password', (req: Request, res: Response): void => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required.' });
    return;
  }
  // Simulate password reset notification
  res.json({ message: 'If an account with this email exists, a password reset link has been dispatched.' });
});

// Get Current User Profile
authRouter.get('/me', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';

  const user = globalAuthStore.getUserByToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized session.' });
    return;
  }

  res.json({ user });
});
