import axios from 'axios';

// In dev, '/api/v1' is proxied to the backend by Vite (see vite.config.ts).
// In production (e.g. Vercel), set VITE_API_BASE_URL to the backend origin,
// e.g. https://your-app.onrender.com/api/v1
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('study_token') || localStorage.getItem('edu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on check code or public endpoints
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/activation/check')) {
        localStorage.removeItem('study_token');
        localStorage.removeItem('study_user');
        localStorage.removeItem('edu_token');
        localStorage.removeItem('edu_user');
      }
    }
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    return Promise.reject(new Error(message));
  }
);

export default api;
