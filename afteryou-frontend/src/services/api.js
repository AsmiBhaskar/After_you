import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'afteryou_token';
const REFRESH_TOKEN_KEY = 'afteryou_refresh_token';

export const tokenService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          tokenService.setTokens(access, refreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    tokenService.setTokens(access, refresh);
    return { user, tokens: { access, refresh } };
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  logout: () => {
    tokenService.clearTokens();
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = tokenService.getRefreshToken();
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    const { access } = response.data;
    tokenService.setTokens(access, refreshToken);
    return access;
  },
};

// Messages API
export const messagesAPI = {
  getMessages: async () => {
    const response = await api.get('/messages/');
    return response.data;
  },

  getMessage: async (id) => {
    const response = await api.get(`/messages/${id}/`);
    return response.data;
  },

  createMessage: async (messageData) => {
    const response = await api.post('/messages/', messageData);
    return response.data;
  },

  updateMessage: async (id, messageData) => {
    const response = await api.put(`/messages/${id}/`, messageData);
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}/`);
    return response.data;
  },

  sendTestMessage: async (messageId) => {
    const response = await api.post('/messages/send-test/', {
      message_id: messageId,
    });
    return response.data;
  },

  scheduleMessage: async (messageId) => {
    const response = await api.post('/messages/schedule/', {
      message_id: messageId,
    });
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats/');
    return response.data;
  },
  
  getSystemStatus: async () => {
    const response = await api.get('/system/status/');
    return response.data;
  },
  
  getJobStatus: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/status/`);
    return response.data;
  },
};

// Generic API error handler
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 
                   error.response.data?.error || 
                   `Error: ${error.response.status}`;
    return { error: true, message, status: error.response.status };
  } else if (error.request) {
    // Request was made but no response received
    return { error: true, message: 'Network error. Please check your connection.' };
  } else {
    // Something else happened
    return { error: true, message: error.message || 'An unexpected error occurred.' };
  }
};

// API status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export default api;
