import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData - axios will set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (backend not running or connection issue)
    if (!error.response) {
      console.error('Network error:', error.message);
      // Check if it's a connection refused error (backend not running)
      if (error.code === 'ECONNREFUSED' || error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        error.response = {
          data: { error: 'Cannot connect to server. Please make sure the backend is running.' },
          status: 503
        };
      } else {
        error.response = {
          data: { error: 'Network error. Please check your internet connection.' },
          status: 0
        };
      }
    }
    
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/verify-email')) {
        window.location.href = '/';
      }
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
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
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
};

export default api;

