import axios from 'axios';
import { checkRateLimit } from '../utils/rateLimiter';

// Extend Window interface for custom properties
declare global {
  interface Window {
    __apiUrlWarningShown?: boolean;
    __connectionErrorShown?: boolean;
  }
}

// Helper function to detect if we're on mobile/tablet
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Helper function to get network IP from current hostname
// If accessing from mobile on same network, use the PC's IP instead of localhost
const getNetworkApiUrl = (): string => {
  const hostname = window.location.hostname;
  
  // If we're accessing from a network IP (not localhost), use that for backend too
  // IP addresses match pattern like 192.168.1.100
  const ipPattern = /^\d+\.\d+\.\d+\.\d+$/;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && ipPattern.test(hostname)) {
    // This is a network IP (e.g., 192.168.1.100)
    return `http://${hostname}:3000/api`;
  }
  
  // If on mobile but accessing via localhost, try to detect network IP
  // We'll store it in localStorage if backend provides it
  const storedNetworkUrl = localStorage.getItem('networkApiUrl');
  if (storedNetworkUrl && isMobileDevice()) {
    return storedNetworkUrl;
  }
  
  // Default: localhost for development
  return 'http://localhost:3000/api';
};

// Automatically detect API URL based on environment
// In production (GitHub Pages), use relative path or configured URL
// In development, use localhost or network IP for mobile testing
const getApiUrl = (): string => {
  // If explicitly set in environment variable, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're in production (deployed on GitHub Pages)
  const isProduction = import.meta.env.PROD || (window.location.hostname !== 'localhost' && !window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/));
  
  if (isProduction) {
    // In production, we need the backend URL
    // For GitHub Pages, backend must be deployed separately (Railway, Render, etc.)
    const relativeApiUrl = '/api';
    
    // Log warning only once, not on every API call
    if (!window.__apiUrlWarningShown) {
      console.warn('Production mode detected. Make sure VITE_API_URL is set during build if backend is on different domain.');
      window.__apiUrlWarningShown = true;
    }
    
    // Return relative path - this will only work if backend is on same domain
    // For GitHub Pages + separate backend, you MUST set VITE_API_URL during build
    return relativeApiUrl;
  }
  
  // Development: use network IP if on mobile/tablet, otherwise localhost
  return getNetworkApiUrl();
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available and check rate limiting
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage for token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - axios will set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Check rate limiting
    const endpoint = config.url || '';
    const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : undefined;
    const rateLimitCheck = checkRateLimit(endpoint, userId);

    if (!rateLimitCheck.isAllowed) {
      // Reject the request with a rate limit error
      return Promise.reject({
        response: {
          data: { error: rateLimitCheck.error || 'For mange forespørsler' },
          status: 429,
          statusText: 'Too Many Requests',
        },
        isAxiosError: true,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Retry helper function
const retryRequest = async (config: any, retryCount = 0): Promise<any> => {
  try {
    return await api.request(config);
  } catch (error: any) {
    // Only retry on network errors or 5xx errors
    const shouldRetry = 
      (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
      retryCount < MAX_RETRIES &&
      !error.config?.__retryCount;
    
    if (shouldRetry) {
      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Mark config to prevent infinite loops
      const retryConfig = { ...config, __retryCount: retryCount + 1 };
      return retryRequest(retryConfig, retryCount + 1);
    }
    
    throw error;
  }
};

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Ignore errors from browser extensions (content_script.js)
    if (error.stack && error.stack.includes('content_script.js')) {
      return Promise.reject(error);
    }
    
    // Handle network errors (backend not running or connection issue)
    if (!error.response) {
      // Only log actual network errors, not browser extension errors
      if (!error.message?.includes('content_script')) {
        console.error('Network error:', error.message);
      }
      
      // Check if it's a connection refused error (backend not running)
      if (error.code === 'ECONNREFUSED' || error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        // Check if we're in production and API URL might be wrong
        const isProduction = import.meta.env.PROD || (window.location.hostname !== 'localhost' && !window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/));
        const isMobile = isMobileDevice();
        const currentHostname = window.location.hostname;
        
        let errorMessage: string;
        if (isProduction) {
          errorMessage = 'Kan ikke koble til backend-server. API URL må konfigureres for produksjon.';
        } else if (isMobile && currentHostname === 'localhost') {
          // On mobile accessing via localhost - need network IP
          errorMessage = 'For mobil-testing: Bruk PC-ens nettverks-IP i stedet for localhost. F.eks. http://192.168.1.100:5173';
        } else {
          // On PC or mobile with network IP
          const backendUrl = API_URL.replace('/api', '');
          errorMessage = `Kan ikke koble til server. Sjekk at backend kjører på ${backendUrl}`;
        }
        
        // Suppress error message - don't show annoying popups
        // Just log it silently
        if (!window.__connectionErrorShown) {
          console.warn('Backend connection issue:', errorMessage);
          window.__connectionErrorShown = true;
        }
        
        error.response = {
          data: { error: errorMessage },
          status: 503
        };
      } else if (!error.message?.includes('content_script')) {
        error.response = {
          data: { error: 'Network error. Please check your internet connection.' },
          status: 0
        };
      }
    }
    
    // Auto-retry for 5xx errors (server errors)
    if (error.response && error.response.status >= 500 && error.response.status < 600) {
      const config = error.config;
      if (config && !config.__retryCount) {
        return retryRequest(config);
      }
    }
    
    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && error.config && !error.config.__skipRefresh) {
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Try to refresh the token using direct axios call to avoid interceptor loop
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          
          if (refreshResponse.data.token) {
            // Store new access token
            const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
            storage.setItem('token', refreshResponse.data.token);
            
            // Update the original request with new token
            error.config.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            
            // Retry the original request
            return api.request(error.config);
          }
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/verify-email')) {
            window.location.href = '/';
          }
        }
      } else {
        // No refresh token - clear and redirect
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/verify-email')) {
          window.location.href = '/';
        }
      }
    }

    // Handle 429 Too Many Requests (rate limiting)
    if (error.response?.status === 429) {
      console.warn('Rate limited:', error.response.data);
    }

    // Handle 500 errors
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, password: string, fullName: string) => {
    const response = await api.post('/auth/register', { email, password, fullName });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    // Token storage is handled by AuthContext based on rememberMe preference
    // Refresh token is also returned and should be stored
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: () => {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// Jobs API
export const jobsAPI = {
  getJobs: async (filters?: { page?: number; limit?: number; search?: string; location?: string; source?: string }) => {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  },

  getJobById: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  refreshJobs: async (search?: string, location?: string) => {
    // Send search filters in request body instead of query params for POST
    const response = await api.post('/jobs/refresh', { q: search, location });
    return response.data;
  },
};

// Profile API
interface ProfileData {
  fullName?: string;
  skills?: string[];
  experience?: number;
  education?: string;
  location?: string;
  bio?: string;
  phone?: string;
  preferences?: Record<string, unknown>;
  emailNotificationsEnabled?: boolean;
}

export const profileAPI = {
  updateProfile: async (profileData: ProfileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  uploadCV: async (file: File) => {
    const formData = new FormData();
    formData.append('cv', file);
    const response = await api.post('/profile/upload-cv', formData, {
      // Don't set Content-Type manually - axios will set it with boundary
    });
    return response.data;
  },

  deleteCV: async () => {
    const response = await api.delete('/profile/cv');
    return response.data;
  },

  getCV: async () => {
    const response = await api.get('/profile/cv', {
      responseType: 'blob',
    });
    return response.data;
  },
};

// AI API
export const aiAPI = {
  generateCoverLetter: async (jobId: string) => {
    const response = await api.post('/ai/cover-letter', { jobId });
    return response.data;
  },

  generateCoverLetterFromText: async (data: { jobTitle: string; company: string; jobDescription: string }) => {
    const response = await api.post('/ai/cover-letter-from-text', data);
    return response.data;
  },

  matchJob: async (jobId: string) => {
    const response = await api.post('/ai/match', { jobId });
    return response.data;
  },

  suggestImprovements: async (targetJobs: string[]) => {
    const response = await api.post('/ai/suggestions', { targetJobs });
    return response.data;
  },
};

// Applications API
export const applicationsAPI = {
  getApplications: async () => {
    const response = await api.get('/applications');
    return response.data;
  },

  getApplication: async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  createApplication: async (applicationData: { jobListingId: string; coverLetter?: string; status?: string }) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  updateApplication: async (id: string, updateData: { status?: string; coverLetter?: string; notes?: string; sentDate?: string; responseDate?: string; response?: string }) => {
    const response = await api.put(`/applications/${id}`, updateData);
    return response.data;
  },

  deleteApplication: async (id: string) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
  bulkDeleteApplications: async (ids: string[]) => {
    const response = await api.post('/applications/bulk/delete', { ids });
    return response.data;
  },
  bulkUpdateApplicationStatus: async (ids: string[], status: string) => {
    const response = await api.post('/applications/bulk/update-status', { ids, status });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },
};

// Scheduler API
export const schedulerAPI = {
  getStatus: async () => {
    const response = await api.get('/scheduler/status');
    return response.data;
  },
  start: async (intervalHours?: number, keywords?: string, location?: string) => {
    const response = await api.post('/scheduler/start', { intervalHours, keywords, location });
    return response.data;
  },
  stop: async () => {
    const response = await api.post('/scheduler/stop');
    return response.data;
  },
};

// Favorites API
export const favoritesAPI = {
  getFavorites: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  addFavorite: async (jobListingId: string) => {
    const response = await api.post('/favorites', { jobListingId });
    return response.data;
  },

  removeFavorite: async (jobListingId: string) => {
    const response = await api.delete(`/favorites/${jobListingId}`);
    return response.data;
  },

  checkFavorite: async (jobListingId: string) => {
    const response = await api.get(`/favorites/${jobListingId}/check`);
    return response.data;
  },
};

export default api;

