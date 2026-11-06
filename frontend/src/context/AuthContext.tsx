import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingEmail: string;
  setPendingEmail: (email: string) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (displayName: string, email: string, password: string) => Promise<any>;
  verifyEmailToken: (token: string) => Promise<any>;
  autoLoginIfVerified: (email: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'studyhub_jwt_token';
const PENDING_EMAIL_KEY = 'studyhub_pending_email';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [pendingEmail, setPendingEmailState] = useState<string>(() => {
    return sessionStorage.getItem(PENDING_EMAIL_KEY) || '';
  });

  const [pendingPassword, setPendingPassword] = useState<string>(() => {
    return sessionStorage.getItem('studyhub_pending_pwd') || '';
  });

  const setPendingEmail = (email: string) => {
    setPendingEmailState(email);
    sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  };

  // Validate active token on initial app load
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe(storedToken);
        setUser({
          id: userData._id || userData.id,
          email: userData.email,
          displayName: userData.displayName || userData.email?.split('@')[0] || 'User',
          isVerified: userData.isVerified ?? true,
          settings: userData.settings || {
            theme: 'light',
            dailyCap: 8,
            taskCap: 4,
            workDuration: 25,
            breakDuration: 5,
            chimeEnabled: true,
            algorithm: {
              invertConfidence: true,
              weights: { confidence: 1.0, pomodoros: 1.0, dueDate: 1.0 },
            },
            accessibility: { highContrast: false, font: 'inter', fontScale: 100 },
          },
        });
        setToken(storedToken);
      } catch (err) {
        console.warn('Session expired or invalid, logging out', err);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.signIn({ email, password });
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);

    const u = result.user;
    setUser({
      id: u._id || u.id,
      email: u.email,
      displayName: u.displayName || u.email?.split('@')[0] || 'User',
      isVerified: u.isVerified ?? true,
      settings: u.settings || {
        theme: 'light',
        dailyCap: 8,
        taskCap: 4,
        workDuration: 25,
        breakDuration: 5,
        chimeEnabled: true,
        algorithm: {
          invertConfidence: true,
          weights: { confidence: 1.0, pomodoros: 1.0, dueDate: 1.0 },
        },
        accessibility: { highContrast: false, font: 'inter', fontScale: 100 },
      },
    });
  };

  const signup = async (displayName: string, email: string, password: string) => {
    setPendingEmail(email);
    setPendingPassword(password);
    sessionStorage.setItem('studyhub_pending_pwd', password);
    return await authApi.signUp({
      name: displayName,
      displayName,
      email,
      password,
    });
  };

  const autoLoginIfVerified = async (email: string) => {
    const pwd = pendingPassword || sessionStorage.getItem('studyhub_pending_pwd');
    if (!pwd) return false;
    try {
      await login(email, pwd);
      sessionStorage.removeItem('studyhub_pending_pwd');
      return true;
    } catch {
      return false;
    }
  };

  const verifyEmailToken = async (verifyToken: string) => {
    const res = await authApi.verifyEmail(verifyToken);
    return res;
  };

  const logout = () => {
    authApi.signOut();
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) return;
    try {
      const userData = await authApi.getMe(storedToken);
      setUser((prev) => ({
        id: userData._id || userData.id || prev?.id || '',
        email: userData.email || prev?.email || '',
        displayName: userData.displayName || prev?.displayName || userData.email?.split('@')[0] || 'User',
        isVerified: userData.isVerified ?? true,
        settings: userData.settings || prev?.settings || {
          theme: 'light',
          dailyCap: 8,
          taskCap: 4,
          workDuration: 25,
          breakDuration: 5,
          chimeEnabled: true,
          algorithm: {
            invertConfidence: true,
            weights: { confidence: 1.0, pomodoros: 1.0, dueDate: 1.0 },
          },
          accessibility: { highContrast: false, font: 'inter', fontScale: 100 },
        },
      }));
    } catch (e) {
      console.warn('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        pendingEmail,
        setPendingEmail,
        login,
        signup,
        verifyEmailToken,
        autoLoginIfVerified,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
