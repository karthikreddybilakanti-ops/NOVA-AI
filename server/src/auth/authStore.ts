import { User } from '../types.js';

interface UserRecord extends User {
  passwordHash: string;
}

export class AuthStore {
  private users: Map<string, UserRecord> = new Map();
  private tokens: Map<string, string> = new Map(); // token -> userId

  constructor() {
    // Seed default admin and standard demo user
    this.seedUser('admin-1', 'Admin Nova', 'admin@nova.ai', 'admin123', 'admin');
    this.seedUser('user-1', 'Demo User', 'user@nova.ai', 'user123', 'user');
    this.seedUser('user-2', 'Karthik', 'karthik@example.com', 'password123', 'user');
  }

  private seedUser(id: string, name: string, email: string, password: string, role: 'user' | 'admin') {
    this.users.set(email.toLowerCase(), {
      id,
      name,
      email: email.toLowerCase(),
      role,
      passwordHash: password, // In production use bcrypt
      createdAt: new Date().toISOString(),
    });
  }

  public register(name: string, email: string, password: string): { user: User; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    if (this.users.has(cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newUser: UserRecord = {
      id,
      name: name.trim() || 'Nova User',
      email: cleanEmail,
      role: 'user',
      passwordHash: password,
      createdAt: new Date().toISOString(),
    };

    this.users.set(cleanEmail, newUser);
    const token = this.generateToken(newUser.id);
    return { user: this.sanitizeUser(newUser), token };
  }

  public login(email: string, password: string): { user: User; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.users.get(cleanEmail);

    if (!user || user.passwordHash !== password) {
      throw new Error('Invalid email address or password.');
    }

    const token = this.generateToken(user.id);
    return { user: this.sanitizeUser(user), token };
  }

  public adminLogin(email: string, password: string): { user: User; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.users.get(cleanEmail);

    if (!user || user.passwordHash !== password) {
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
