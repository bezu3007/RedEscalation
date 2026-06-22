import axios from "axios";
import { useAuthStore } from "@/features/auth/store/authStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      if (!refreshToken) {
        logout();
        window.location.href = "/login";
        return Promise.reject(err);
      }

      if (!refreshing) {
        refreshing = axios
          .post(`${import.meta.env.VITE_API_BASE_URL ?? "/api"}/auth/refresh`, {
            refreshToken,
          })
          .then((r) => {
            setTokens(r.data.accessToken, r.data.refreshToken);
            return r.data.accessToken;
          })
          .catch(() => {
            logout();
            window.location.href = "/login";
            return Promise.reject(err);
          })
          .finally(() => {
            refreshing = null;
          });
      }

      const newToken = await refreshing;
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    }

    return Promise.reject(err);
  }
);