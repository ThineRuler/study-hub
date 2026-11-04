import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  pendingEmail: string;
  setPendingEmail: (email: string) => void;
  login: (email: string) => void;
  signup: (displayName: string, email: string) => void;
  verifyEmail: (code: string) => boolean;
  logout: () => void;
}

const DEFAULT_MOCK_USER: User = {
  id: 'usr_mock_1',
  email: 'alex.morgan@example.com',
  displayName: 'Alex Morgan',
  isVerified: true,
  settings: {
    theme: 'light',
    dailyCap: 8,
    taskCap: 4,
    workDuration: 25,
    breakDuration: 5,
    chimeEnabled: true,
    algorithm: {
      invertConfidence: true,
      weights: {
        confidence: 1.0,
        pomodoros: 1.0,
        dueDate: 1.0,
      },
    },
    accessibility: {
      highContrast: false,
      font: 'inter',
      fontScale: 100,
    },
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'studyhub_auth_user';
const PENDING_EMAIL_KEY = 'studyhub_pending_email';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [pendingEmail, setPendingEmailState] = useState<string>(() => {
    return sessionStorage.getItem(PENDING_EMAIL_KEY) || 'alex.morgan@example.com';
  });

  const setPendingEmail = (email: string) => {
    setPendingEmailState(email);
    sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string) => {
    const loggedUser: User = {
      ...DEFAULT_MOCK_USER,
      email: email || DEFAULT_MOCK_USER.email,
    };
    setUser(loggedUser);
  };

  const signup = (displayName: string, email: string) => {
    setPendingEmail(email);
  };

  const verifyEmail = (_code: string) => {
    const verifiedUser: User = {
      ...DEFAULT_MOCK_USER,
      email: pendingEmail || DEFAULT_MOCK_USER.email,
      isVerified: true,
    };
    setUser(verifiedUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        pendingEmail,
        setPendingEmail,
        login,
        signup,
        verifyEmail,
        logout,
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
