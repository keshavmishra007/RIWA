import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserRole, AuthState } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { authApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  loginAsRole: (role: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('riwa_auth');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { user: null, token: null, isAuthenticated: false };
      }
    }
    return { user: null, token: null, isAuthenticated: false };
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Try live API first
    try {
      const data = await authApi.login(email.trim(), password);
      const state: AuthState = {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      };
      setAuthState(state);
      localStorage.setItem('riwa_auth', JSON.stringify(state));
      return true;
    } catch {
      // Fallback to local demo user
      const cleanEmail = email.trim().toLowerCase();
      const demoUser = Object.values(DEMO_USERS).find(
        (u) =>
          u.email.toLowerCase() === cleanEmail &&
          (u.password === password || (cleanEmail.includes('demo') && (password === 'demo' || password === 'demo123')))
      );

      if (demoUser) {
        const { password: _, ...user } = demoUser;
        const state: AuthState = {
          user,
          token: `demo-token-${user.role.toLowerCase()}`,
          isAuthenticated: true,
        };
        setAuthState(state);
        localStorage.setItem('riwa_auth', JSON.stringify(state));
        return true;
      }
      return false;
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: UserRole = 'CITIZEN'): Promise<boolean> => {
      try {
        const data = await authApi.register({ name: name.trim(), email: email.trim(), password, role });
        const state: AuthState = {
          user: data.user,
          token: data.token,
          isAuthenticated: true,
        };
        setAuthState(state);
        localStorage.setItem('riwa_auth', JSON.stringify(state));
        return true;
      } catch (err) {
        console.error('Registration failed:', err);
        return false;
      }
    },
    []
  );

  const loginAsRole = useCallback(async (role: UserRole): Promise<boolean> => {
    try {
      const data = await authApi.demoLogin(role);
      const state: AuthState = {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      };
      setAuthState(state);
      localStorage.setItem('riwa_auth', JSON.stringify(state));
      return true;
    } catch {
      const roleKey = role.toLowerCase() as keyof typeof DEMO_USERS;
      const demoUser = DEMO_USERS[roleKey];
      if (demoUser) {
        const { password: _, ...user } = demoUser;
        const state: AuthState = {
          user,
          token: `demo-token-${role.toLowerCase()}`,
          isAuthenticated: true,
        };
        setAuthState(state);
        localStorage.setItem('riwa_auth', JSON.stringify(state));
        return true;
      }
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('riwa_auth');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        loginAsRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
