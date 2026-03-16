import React, { createContext, useContext, useState, useCallback } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, userType: 'externo' | 'interno') => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: (User & { password: string })[] = [
  { id: 'admin1', name: 'Ana Silva', email: 'admin@utfpr.edu.br', user_type: 'interno', password: 'admin123' },
  { id: 'user1', name: 'Maria Santos', email: 'maria@email.com', user_type: 'externo', password: 'user123' },
  { id: 'user2', name: 'Julia Oliveira', email: 'julia@email.com', user_type: 'externo', password: 'user123' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const found = mockUsers.find(u => u.email === email && u.password === password);
    setIsLoading(false);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string, userType: 'externo' | 'interno'): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      user_type: userType,
    };
    setUser(newUser);
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const isAdmin = user?.user_type === 'interno';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
