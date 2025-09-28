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
  token: string | null; // Adicionado para acesso ao token
}

// Corrigido: Exportando o AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [token, setToken] = useState<string | null>(Cookies.get('auth_token') || null);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    const authToken = Cookies.get('auth_token');
    if (!authToken) {
      setUser(null);
      setToken(null);
      setIsAuthLoading(false);
      return;
    }
    
    setToken(authToken);
    
    try {
      const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${authToken}` } });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        Cookies.remove('auth_token');
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      Cookies.remove('auth_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const login = async (newToken: string) => {
    setIsAuthLoading(true);
    Cookies.set('auth_token', newToken, { expires: 1 });
    setToken(newToken);
    await fetchUserData();
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const value = { isAuthenticated: !!user, user, isAuthLoading, login, logout, refetchUser: fetchUserData, token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}