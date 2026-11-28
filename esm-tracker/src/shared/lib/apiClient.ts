// shared/lib/apiClient.ts
import axios from "axios";

const preferredBase = "/api";

// Resolve the runtime API base URL. Preserve absolute URLs so requests can
// target the intended backend host/port, while keeping relative values
// normalized for local development and deployments behind a front-end proxy.
const rawBase = (import.meta.env.VITE_API_BASE_URL ?? preferredBase).toString().trim();
let baseURL = rawBase;

try {
  if (rawBase.startsWith("http://") || rawBase.startsWith("https://")) {
    const u = new URL(rawBase);
    const normalizedPath = u.pathname.replace(/\/+$/, "");
    baseURL = `${u.protocol}//${u.host}${normalizedPath}`;
  } else if (rawBase && !rawBase.startsWith("/")) {
    baseURL = `/${rawBase.replace(/^\/+/, "")}`;
  }
} catch {
  baseURL = rawBase || preferredBase;
}

export const apiClient = axios.create({
  baseURL,
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