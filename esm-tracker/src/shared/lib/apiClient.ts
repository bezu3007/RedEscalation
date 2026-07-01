// shared/lib/apiClient.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
  withCredentials: true, // Important for cookie-based auth
});

// Request interceptor - just add any needed headers
apiClient.interceptors.request.use((config) => {
  // If using cookie-based auth, we don't need to add tokens manually
  // The cookies will be sent automatically with withCredentials: true
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 and not login request, redirect to login
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      // Clear any stored user data
      localStorage.removeItem('ems-user');
      localStorage.removeItem('ems-login-timestamp');
      
      // Redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);