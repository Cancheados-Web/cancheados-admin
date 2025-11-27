import axios, { AxiosError } from 'axios';
import type {
  User,
  LoginCredentials,
  LoginResponse,
  ApiError
} from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// =====================================================
// AXIOS INSTANCE CONFIGURATION
// =====================================================

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// =====================================================
// TOKEN MANAGEMENT
// =====================================================

const TOKEN_KEY = 'admin_auth_token';
const USER_KEY = 'admin_user';

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getUser: (): any | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser: (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },
  
  clear: (): void => {
    tokenManager.removeToken();
    tokenManager.removeUser();
  }
};

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized - token expired or invalid
    // Only redirect to login if it's an auth endpoint or if we're not already on login page
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const isLoginPage = window.location.pathname === '/login';
      
      // Only clear tokens and redirect for auth endpoints or critical failures
      if (isAuthEndpoint && !isLoginPage) {
        tokenManager.clear();
        window.location.href = '/login';
      }
      // For other 401s, just log them - let React Query handle the error
      else if (!isLoginPage) {
        console.warn('API request failed with 401:', error.config?.url);
      }
    }
    
    // Handle 403 Forbidden - not admin
    if (error.response?.status === 403) {
      console.error('Access denied: Admin privileges required');
    }
    
    // Format error message
    const apiError: ApiError = {
      error: error.response?.data?.error || 'Error',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status
    };
    
    return Promise.reject(apiError);
  }
);

// =====================================================
// AUTHENTICATION API
// =====================================================

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', credentials);
    
    // Store token and user info
    const token = (response.data as any).token || (response.data as any).tokens?.accessToken;
    if (token) {
      tokenManager.setToken(token);
    }
    if ((response.data as any).user) {
      tokenManager.setUser((response.data as any).user);
    }
    
    return response.data;
  },
  
  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clear();
    }
  },
  
  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/users/me');
    return response.data;
  },
  
  /**
   * Check if user is authenticated and is admin
   */
  isAuthenticated: (): boolean => {
    const token = tokenManager.getToken();
    const user = tokenManager.getUser();
    return !!(token && user && user.is_admin);
  },
  
  /**
   * Get stored user info
   */
  getStoredUser: (): any | null => {
    return tokenManager.getUser();
  }
};

// =====================================================
// USER API (keeping existing function)
// =====================================================

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/api/users');
  return response.data;
};

// =====================================================
// EXPORTS
// =====================================================

export type { User, LoginCredentials, LoginResponse, ApiError };

// Export api instance with multiple names for compatibility
export { api as apiClient };
export default api;

// Export new API modules
export { usersApi } from './api/users';
export { teamsApi } from './api/teams';
export { disputesApi } from './api/disputes';
export { venuesApi } from './api/venues';
