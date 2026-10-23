import axios from 'axios';
import { handleMockRequest } from './mockApi';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 5000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401, graceful fallback to mock API on network error
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    // If backend is unreachable (network error or timeout), fallback to client mock
    const isNetworkError =
      !err.response &&
      (err.code === 'ERR_NETWORK' ||
        err.code === 'ECONNREFUSED' ||
        err.code === 'ECONNABORTED' ||
        err.message?.includes('Network Error') ||
        err.message?.includes('timeout') ||
        !err.status);

    if (isNetworkError) {
      console.warn('[EduLeave] Backend server unreachable. Using local demo database fallback.');
      try {
        const mockResponse = await handleMockRequest(err.config);
        return mockResponse;
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

