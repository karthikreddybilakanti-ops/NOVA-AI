export class AuthStore {
    users = new Map();
    tokens = new Map(); // token -> userId
    constructor() {
        // Seed default admin and standard demo user
        this.seedUser('admin-1', 'Admin Nova', 'admin@nova.ai', 'admin123', 'admin');
        this.seedUser('user-1', 'Demo User', 'user@nova.ai', 'user123', 'user');
        this.seedUser('user-2', 'Karthik', 'karthik@example.com', 'password123', 'user');
    }
    seedUser(id, name, email, password, role) {
        this.users.set(email.toLowerCase(), {
            id,
            name,
            email: email.toLowerCase(),
            role,
            passwordHash: password, // In production use bcrypt
            createdAt: new Date().toISOString(),
        });
    }
    register(name, email, password) {
        const cleanEmail = email.toLowerCase().trim();
        if (this.users.has(cleanEmail)) {
            throw new Error('An account with this email address already exists.');
        }
        const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const newUser = {
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
    login(email, password) {
        const cleanEmail = email.toLowerCase().trim();
        const user = this.users.get(cleanEmail);
        if (!user || user.passwordHash !== password) {
            throw new Error('Invalid email address or password.');
        }
        const token = this.generateToken(user.id);
        return { user: this.sanitizeUser(user), token };
    }
    adminLogin(email, password) {
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
    getUserByToken(token) {
        if (!token)
            return null;
        const userId = this.tokens.get(token);
        if (!userId)
            return null;
        for (const u of this.users.values()) {
            if (u.id === userId) {
                return this.sanitizeUser(u);
            }
        }
        return null;
    }
    getUsers() {
        return Array.from(this.users.values()).map((u) => this.sanitizeUser(u));
    }
    generateToken(userId) {
        const token = `nova_${userId}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
        this.tokens.set(token, userId);
        return token;
    }
    sanitizeUser(user) {
        const { passwordHash, ...safe } = user;
        return safe;
    }
}
export const globalAuthStore = new AuthStore();
