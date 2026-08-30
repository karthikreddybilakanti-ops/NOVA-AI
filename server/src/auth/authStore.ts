import bcrypt from 'bcryptjs';
import { User } from '../types.js';

interface UserRecord extends User {
  passwordHash: string;
}

export class AuthStore {
  private users: Map<string, UserRecord> = new Map();
  private tokens: Map<string, string> = new Map(); // token -> userId

  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers(): void {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nova.ai').toLowerCase().trim();
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    // Seed default admin with bcrypt hash
    this.seedUser('admin-1', 'Admin Nova', adminEmail, adminPass, 'admin');

    // Seed demo user with bcrypt hash
    this.seedUser('user-1', 'Demo User', 'user@nova.ai', 'user123', 'user');
    this.seedUser('user-2', 'Karthik', 'karthik@example.com', 'password123', 'user');
  }

  public seedUser(id: string, name: string, email: string, rawPassword: string, role: 'user' | 'admin'): UserRecord {
    const cleanEmail = email.toLowerCase().trim();
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(rawPassword, salt);

    const user: UserRecord = {
      id,
      name,
      email: cleanEmail,
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    this.users.set(cleanEmail, user);
    return user;
  }

  public resetAdmin(email?: string, password?: string): User {
    const cleanEmail = (email || process.env.ADMIN_EMAIL || 'admin@nova.ai').toLowerCase().trim();
    const rawPass = password || process.env.ADMIN_PASSWORD || 'admin123';

    // Check if existing admin exists and update, or create new
    let existingAdmin: UserRecord | undefined = undefined;
    for (const u of this.users.values()) {
      if (u.role === 'admin' || u.email === cleanEmail) {
        existingAdmin = u;
        break;
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(rawPass, salt);

    if (existingAdmin) {
      this.users.delete(existingAdmin.email);
      existingAdmin.email = cleanEmail;
      existingAdmin.passwordHash = passwordHash;
      this.users.set(cleanEmail, existingAdmin);
      return this.sanitizeUser(existingAdmin);
    } else {
      const newAdmin: UserRecord = {
        id: `admin-${Date.now().toString(36)}`,
        name: 'Admin Nova',
        email: cleanEmail,
        role: 'admin',
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      this.users.set(cleanEmail, newAdmin);
      return this.sanitizeUser(newAdmin);
    }
  }

  public register(name: string, email: string, password: string): { user: User; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    if (this.users.has(cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: UserRecord = {
      id,
      name: name.trim() || 'Nova User',
      email: cleanEmail,
      role: 'user',
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    this.users.set(cleanEmail, newUser);
    const token = this.generateToken(newUser.id);
    return { user: this.sanitizeUser(newUser), token };
  }

  public login(email: string, password: string): { user: User; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.users.get(cleanEmail);

    if (!user) {
      throw new Error('Invalid email address or password.');
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email address or password.');
    }

    const token = this.generateToken(user.id);
    return { user: this.sanitizeUser(user), token };
  }

  public adminLogin(email: string, password: string): { user: User; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.users.get(cleanEmail);

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

    const token = this.generateToken(user.id);
    return { user: this.sanitizeUser(user), token };
  }

  public getUserByToken(token: string): User | null {
    if (!token) return null;
    const userId = this.tokens.get(token);
    if (!userId) return null;

    for (const u of this.users.values()) {
      if (u.id === userId) {
        return this.sanitizeUser(u);
      }
    }
    return null;
  }

  public getUsers(): User[] {
    return Array.from(this.users.values()).map((u) => this.sanitizeUser(u));
  }

  private generateToken(userId: string): string {
    const token = `nova_${userId}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    this.tokens.set(token, userId);
    return token;
  }

  private sanitizeUser(user: UserRecord): User {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

export const globalAuthStore = new AuthStore();
