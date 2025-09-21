'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  nomeCompleto: string;
  email: string;
  tipoUsuario: string;
  nomeNegocio: string | null;
  descricaoNegocio: string | null;
  logoUrl: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAuthLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    const token = Cookies.get('auth_token');
    if (!token) {
      setUser(null);
      setIsAuthLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        Cookies.remove('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      Cookies.remove('auth_token');
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const login = async (token: string) => {
    setIsAuthLoading(true);
    Cookies.set('auth_token', token, { expires: 1 });
    await fetchUserData();
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
    router.push('/login');
  };

  const value = { isAuthenticated: !!user, user, isAuthLoading, login, logout, refetchUser: fetchUserData };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}