import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, tokenManager } from '../lib/api';
import type { AuthUser, LoginCredentials } from '../lib/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const storedUser = tokenManager.getUser();
      const token = tokenManager.getToken();

      if (token && storedUser) {
        // Check if stored user is admin
        if (!storedUser.is_admin) {
          tokenManager.clear();
          setUser(null);
        } else {
          // Trust the stored user data
          // The axios interceptor will handle token expiration on actual API calls
          setUser({
            userId: storedUser.userId || storedUser.id,
            email: storedUser.email,
            nombre: storedUser.nombre,
            is_admin: storedUser.is_admin
          });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      
      // Check if user is admin
      if (!response.user.is_admin) {
        tokenManager.clear();
        throw new Error('Access denied: Admin privileges required');
      }
      
      setUser(response.user);
    } catch (error) {
      tokenManager.clear();
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clear();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}