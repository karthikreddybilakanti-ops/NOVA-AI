import bcrypt from 'bcryptjs';
import { User } from '../types.js';
import { supabase } from '../supabase.js';

interface UserRecord extends User {
  passwordHash: string;
}

export class AuthService {
  // Local cache/fallback for environments without Supabase configured
  private localUsers: Map<string, UserRecord> = new Map();
  private localTokens: Map<string, string> = new Map();

  constructor() {
    this.initFallbackAdmin();
  }

  private initFallbackAdmin(): void {
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const adminPass = process.env.ADMIN_PASSWORD || '';

    if (adminEmail && adminPass) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(adminPass, salt);

      this.localUsers.set(adminEmail, {
        id: 'admin-1',
        name: 'Admin Nova',
        email: adminEmail,
        role: 'admin',
        passwordHash,
        createdAt: new Date().toISOString(),
      });
    } else {
      console.log('ℹ️ ADMIN_EMAIL / ADMIN_PASSWORD not set in environment. Use "npm run seed:admin" with your credentials to initialize administrator access.');
    }
  }

  /**
   * User Signup — Creates account in Supabase Auth as single source of truth
   */
  public async signUp(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim() || 'Nova User';

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // 1. Production Supabase Auth
    if (supabase) {
      // If service role key is available, create confirmed user directly
      if (supabase.auth.admin) {
        const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: { name: cleanName, role: 'user' },
        });

        if (createError) {
          const msg = createError.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('duplicate') || msg.includes('exists')) {
            throw new Error('An account with this email address already exists.');
          }
          throw new Error(createError.message || 'Signup failed.');
        }

        // Sign in immediately to generate authentic Supabase session access_token
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (sessionError || !sessionData.session) {
          throw new Error(sessionError?.message || 'Authentication session creation failed.');
        }

        const user: User = {
          id: sessionData.user.id,
          name: sessionData.user.user_metadata?.name || cleanName,
          email: sessionData.user.email || cleanEmail,
          role: 'user',
          createdAt: sessionData.user.created_at,
        };

        return { user, token: sessionData.session.access_token };
      } else {
        // Fallback to standard Supabase signUp
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { name: cleanName, role: 'user' } },
        });

        if (authError) {
          const msg = authError.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('duplicate') || msg.includes('exists')) {
            throw new Error('An account with this email address already exists.');
          }
          throw new Error(authError.message || 'Signup failed.');
        }

        if (authData.session) {
          const user: User = {
            id: authData.user!.id,
            name: authData.user!.user_metadata?.name || cleanName,
            email: authData.user!.email || cleanEmail,
            role: 'user',
            createdAt: authData.user!.created_at,
          };
          return { user, token: authData.session.access_token };
        }

        // Try sign in
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (sessionError || !sessionData.session) {
          throw new Error('Account created. Please verify your email or sign in.');
        }

        const user: User = {
          id: sessionData.user.id,
          name: sessionData.user.user_metadata?.name || cleanName,
          email: sessionData.user.email || cleanEmail,
          role: 'user',
          createdAt: sessionData.user.created_at,
        };

        return { user, token: sessionData.session.access_token };
      }
    }

    // 2. Local Fallback Mode (when SUPABASE_URL not configured)
    if (this.localUsers.has(cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: UserRecord = {
      id,
      name: cleanName,
      email: cleanEmail,
      role: 'user',
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    this.localUsers.set(cleanEmail, newUser);
    const token = this.generateLocalToken(newUser.id);
    return { user: this.sanitizeUser(newUser), token };
  }

  /**
   * User Login — Authenticates against Supabase Auth
   */
  public async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !password) {
      throw new Error('Email and password are required.');
    }

    // 1. Production Supabase Auth
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.session || !data.user) {
        throw new Error('Invalid email address or password.');
      }

      const adminEnvEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
      const isAdmin =
        data.user.user_metadata?.role === 'admin' ||
        data.user.app_metadata?.role === 'admin' ||
        (adminEnvEmail && data.user.email?.toLowerCase() === adminEnvEmail);

      const user: User = {
        id: data.user.id,
        name: data.user.user_metadata?.name || 'Nova User',
        email: data.user.email || cleanEmail,
        role: isAdmin ? 'admin' : 'user',
        createdAt: data.user.created_at,
      };

      return { user, token: data.session.access_token };
    }

    // 2. Local Fallback Mode
    const user = this.localUsers.get(cleanEmail);
    if (!user) {
      throw new Error('Invalid email address or password.');
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email address or password.');
    }

    const token = this.generateLocalToken(user.id);
    return { user: this.sanitizeUser(user), token };
  }

  /**
   * Admin Login — Authenticates and strictly verifies Administrator privileges
   */
  public async adminLogin(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !password) {
      throw new Error('Administrator email and password are required.');
    }

    // 1. Production Supabase Auth
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.session || !data.user) {
        throw new Error('Invalid administrator credentials.');
      }

      const adminEnvEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
      const isAdmin =
        data.user.user_metadata?.role === 'admin' ||
        data.user.app_metadata?.role === 'admin' ||
        (adminEnvEmail && data.user.email?.toLowerCase() === adminEnvEmail);

      if (!isAdmin) {
        throw new Error('Access denied. Administrator privileges required.');
      }

      const user: User = {
        id: data.user.id,
        name: data.user.user_metadata?.name || 'Admin Nova',
        email: data.user.email || cleanEmail,
        role: 'admin',
        createdAt: data.user.created_at,
      };

      return { user, token: data.session.access_token };
    }

    // 2. Local Fallback Mode
    const user = this.localUsers.get(cleanEmail);
    if (!user) {
      throw new Error('Invalid administrator credentials.');
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid administrator credentials.');
    }

    if (user.role !== 'admin') {
      throw new Error('Access denied. Administrator privileges required.');
    }

    const token = this.generateLocalToken(user.id);
    return { user: this.sanitizeUser(user), token };
  }

  /**
   * Session Validation — Validates Supabase JWT Bearer token
   */
  public async getUserByToken(token: string): Promise<User | null> {
    if (!token) return null;

    // 1. Production Supabase Auth Verification
    if (supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          // Token may be a local fallback token
          return this.getLocalUserByToken(token);
        }

        const adminEnvEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
        const isAdmin =
          user.user_metadata?.role === 'admin' ||
          user.app_metadata?.role === 'admin' ||
          (adminEnvEmail && user.email?.toLowerCase() === adminEnvEmail);

        return {
          id: user.id,
          name: user.user_metadata?.name || 'Nova User',
          email: user.email || '',
          role: isAdmin ? 'admin' : 'user',
          createdAt: user.created_at,
        };
      } catch (err) {
        return this.getLocalUserByToken(token);
      }
    }

    // 2. Local Fallback Token Lookup
    return this.getLocalUserByToken(token);
  }

  /**
   * Admin Reset / Setup — Securely seeds or updates admin account in Supabase
   */
  public async seedAdmin(email?: string, password?: string): Promise<User> {
    const adminEmail = (email || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const adminPass = password || process.env.ADMIN_PASSWORD || '';

    if (!adminEmail || !adminPass) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment or provided as arguments to initialize administrator access.');
    }

    if (supabase && supabase.auth.admin) {
      try {
        // Check if admin user already exists in Supabase
        const { data: userList } = await supabase.auth.admin.listUsers();
        const existing = userList?.users?.find((u) => u.email?.toLowerCase() === adminEmail);

        if (existing) {
          const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(
            existing.id,
            {
              password: adminPass,
              user_metadata: { role: 'admin', name: 'Admin Nova' },
              email_confirm: true,
            }
          );
          if (updateErr) throw updateErr;
          return {
            id: updated.user.id,
            name: updated.user.user_metadata?.name || 'Admin Nova',
            email: updated.user.email || adminEmail,
            role: 'admin',
            createdAt: updated.user.created_at,
          };
        } else {
          const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPass,
            user_metadata: { role: 'admin', name: 'Admin Nova' },
            email_confirm: true,
          });
          if (createErr) throw createErr;
          return {
            id: created.user.id,
            name: created.user.user_metadata?.name || 'Admin Nova',
            email: created.user.email || adminEmail,
            role: 'admin',
            createdAt: created.user.created_at,
          };
        }
      } catch (err: any) {
        console.warn('⚠️ Supabase Admin seed notice:', err.message);
      }
    }

    // Fallback seed in local memory
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(adminPass, salt);
    const localAdmin: UserRecord = {
      id: 'admin-1',
      name: 'Admin Nova',
      email: adminEmail,
      role: 'admin',
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.localUsers.set(adminEmail, localAdmin);
    return this.sanitizeUser(localAdmin);
  }

  /**
   * Get all registered users (for admin overview)
   */
  public async getUsers(): Promise<User[]> {
    if (supabase && supabase.auth.admin) {
      try {
        const { data: userList } = await supabase.auth.admin.listUsers();
        if (userList?.users) {
          const adminEnvEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
          return userList.users.map((u) => ({
            id: u.id,
            name: u.user_metadata?.name || 'Nova User',
            email: u.email || '',
            role:
              u.user_metadata?.role === 'admin' ||
              u.app_metadata?.role === 'admin' ||
              (adminEnvEmail && u.email?.toLowerCase() === adminEnvEmail)
                ? 'admin'
                : 'user',
            createdAt: u.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase listUsers warning:', err);
      }
    }

    return Array.from(this.localUsers.values()).map((u) => this.sanitizeUser(u));
  }

  /**
   * Request Password Reset — Dispatches email link via Supabase Auth
   */
  public async requestPasswordReset(email: string, redirectTo?: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please provide a valid email address.');
    }

    const resetRedirect = redirectTo || process.env.RESET_PASSWORD_REDIRECT_URL || 'https://client-swart-zeta-12.vercel.app/reset-password';

    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: resetRedirect,
      });
      if (error) {
        throw new Error(error.message || 'Failed to dispatch password reset email.');
      }
      return {
        success: true,
        message: 'A password reset link has been dispatched to your email address.',
      };
    }

    // Local fallback mode
    const user = this.localUsers.get(cleanEmail);
    if (!user) {
      return {
        success: true,
        message: 'If an account with this email exists, a password reset link has been dispatched.',
      };
    }

    return {
      success: true,
      message: 'Password reset link generated. Follow the instructions sent to your email.',
    };
  }

  /**
   * Reset Password with New Password
   */
  public async resetPassword(emailOrToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const cleanIdentifier = (emailOrToken || '').toLowerCase().trim();

    if (supabase && supabase.auth.admin) {
      try {
        const { data: userList } = await supabase.auth.admin.listUsers();
        const user = userList?.users?.find((u) => u.email?.toLowerCase() === cleanIdentifier || u.id === cleanIdentifier);
        if (user) {
          const { error } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
          if (error) throw error;
          return { success: true, message: 'Password updated successfully. You can now sign in.' };
        }
      } catch (err: any) {
        console.warn('Supabase admin reset password notice:', err);
      }
    }

    // Local fallback update
    const user = this.localUsers.get(cleanIdentifier);
    if (user) {
      const salt = bcrypt.genSaltSync(10);
      user.passwordHash = bcrypt.hashSync(newPassword, salt);
      return { success: true, message: 'Password updated successfully. You can now sign in.' };
    }

    return { success: true, message: 'Password updated successfully. You can now sign in.' };
  }

  private getLocalUserByToken(token: string): User | null {
    const userId = this.localTokens.get(token);
    if (!userId) return null;
    for (const u of this.localUsers.values()) {
      if (u.id === userId) return this.sanitizeUser(u);
    }
    return null;
  }

  private generateLocalToken(userId: string): string {
    const token = `nova_${userId}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    this.localTokens.set(token, userId);
    return token;
  }

  private sanitizeUser(user: UserRecord): User {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

export const globalAuthService = new AuthService();
