import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Check both localStorage and sessionStorage for token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        try {
          const data = await authAPI.getMe();
          setUser(data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear both storages
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const data = await authAPI.login(email, password);
    
    // Store tokens
    if (data.token) {
      if (rememberMe) {
        // Store in localStorage (persists across sessions)
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      } else {
        // Store in sessionStorage (cleared when browser closes)
        sessionStorage.setItem('token', data.token);
        if (data.refreshToken) {
          sessionStorage.setItem('refreshToken', data.refreshToken);
        }
        localStorage.removeItem('token'); // Remove any existing token
        localStorage.removeItem('refreshToken');
      }
    }
    
    setUser(data.user);
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const data = await authAPI.register(email, password, fullName);
    
    // Don't auto-login - user needs to verify email first
    // setUser(data.user);
    // setIsAuthenticated(true);
    
    // Return the verification token to show in UI
    return data;
  };

  const logout = () => {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        const data = await authAPI.getMe();
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
        showLoginModal,
        setShowLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

