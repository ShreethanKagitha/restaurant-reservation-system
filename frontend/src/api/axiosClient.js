import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token to headers if it exists
axiosClient.interceptors.request.use(
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

// Response Interceptor: Intercept errors, handle 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Check if unauthorized (token expired, invalid, etc.)
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // If we are not already on the login page, redirect
      if (!window.location.pathname.includes('/login')) {
        window.location.href = `/login?expired=true`;
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
