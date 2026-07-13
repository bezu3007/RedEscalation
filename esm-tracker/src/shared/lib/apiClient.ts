// shared/lib/apiClient.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
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