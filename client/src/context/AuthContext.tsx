import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getProfileApi, loginApi, signupApi, adminLoginApi, logoutApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  adminLogin: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nova_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nova_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      getProfileApi()
        .then(({ user }) => {
          setUser(user);
          localStorage.setItem('nova_user', JSON.stringify(user));
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await loginApi(email, pass);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('nova_auth_token', data.token);
    localStorage.setItem('nova_user', JSON.stringify(data.user));
  };

  const adminLogin = async (email: string, pass: string) => {
    const data = await adminLoginApi(email, pass);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('nova_auth_token', data.token);
    localStorage.setItem('nova_user', JSON.stringify(data.user));
  };

  const signup = async (name: string, email: string, pass: string) => {
    const data = await signupApi(name, email, pass);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('nova_auth_token', data.token);
    localStorage.setItem('nova_user', JSON.stringify(data.user));
  };

  const logout = () => {
    logoutApi().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('nova_auth_token');
    localStorage.removeItem('nova_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        adminLogin,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
