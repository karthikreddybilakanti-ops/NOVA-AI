import { globalAuthService, AuthService } from './authService.js';
import { User } from '../types.js';

/**
 * AuthStore adapter delegating to persistent Supabase AuthService
 */
export const globalAuthStore = {
  register: (name: string, email: string, pass: string): Promise<{ user: User; token: string }> => {
    return globalAuthService.signUp(name, email, pass);
  },
  login: (email: string, pass: string): Promise<{ user: User; token: string }> => {
    return globalAuthService.login(email, pass);
  },
  adminLogin: (email: string, pass: string): Promise<{ user: User; token: string }> => {
    return globalAuthService.adminLogin(email, pass);
  },
  getUserByToken: (token: string): Promise<User | null> => {
    return globalAuthService.getUserByToken(token);
  },
  resetAdmin: (email?: string, pass?: string): Promise<User> => {
    return globalAuthService.seedAdmin(email, pass);
  },
  getUsers: (): Promise<User[]> => {
    return globalAuthService.getUsers();
  },
};

export { globalAuthService, AuthService };
