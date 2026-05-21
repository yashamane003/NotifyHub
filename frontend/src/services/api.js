import axios from 'axios';

// Creating an Axios instance.
// Using relative /api path so that Nginx proxy handles production, 
// and Vite dev server proxy handles development automatically.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject the JWT Token automatically on all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle authentication failures gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid: logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we are not already on the login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
