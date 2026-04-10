import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { allUsers, currentUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string, fullName: string, role: UserRole) => Promise<User | null>;
  logout: () => void;
  registeredUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'quickcourt-auth-user';
const USERS_STORAGE_KEY = 'quickcourt-registered-users';
const TOKEN_STORAGE_KEY = 'quickcourt-jwt';

const readStoredUser = () => {
  if (typeof window === 'undefined') return currentUser;

  const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (storedUser === null) return null;

  try {
    return JSON.parse(storedUser) as User | null;
  } catch {
    return null;
  }
};

const readStoredUsers = () => {
  if (typeof window === 'undefined') return allUsers;

  const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
  if (!storedUsers) return allUsers;

  try {
    return JSON.parse(storedUsers) as User[];
  } catch {
    return allUsers;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readStoredUser());
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(readStoredUsers());

  useEffect(() => {
    const hydrateAuth = async () => {
      if (typeof window === 'undefined') return;

      const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        return;
      }

      try {
        const { api } = await import('@/lib/api');
        const response = await api.auth.me();
        setUser(response.user);
      } catch {
        setUser(null);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    };

    hydrateAuth();
  }, []);

  const persistUser = (nextUser: User | null) => {
    setUser(nextUser);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    }
  };

  const persistToken = (token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      return;
    }
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const persistUsers = (nextUsers: User[]) => {
    setRegisteredUsers(nextUsers);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { api } = await import('@/lib/api');
      const response = await api.auth.login(email, password);
      persistToken(response.token);
      persistUser(response.user);
      return response.user;
    } catch {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = registeredUsers.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);

      if (existingUser) {
        persistToken(null);
        persistUser(existingUser);
        return existingUser;
      }

      persistUser(null);
      persistToken(null);
      return null;
    }
  }, [registeredUsers]);

  const signup = useCallback(async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const { api } = await import('@/lib/api');
      const response = await api.auth.register({ fullName, email, password, role });
      persistToken(response.token);
      persistUser(response.user);
      return response.user;
    } catch {
      const existingUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        persistUser(existingUser);
        return existingUser;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        fullName,
        role,
        avatar: '',
        password,
      };

      persistUsers([...registeredUsers, newUser]);
      persistUser(newUser);
      return newUser;
    }
  }, [registeredUsers]);

  const logout = useCallback(() => {
    const runLogout = async () => {
      try {
        const { api } = await import('@/lib/api');
        await api.auth.logout();
      } catch {
        // No-op. Local token cleanup still happens below.
      }
    };

    void runLogout();
    persistUser(null);
    persistToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, registeredUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
