import { apiClient } from "@/shared/lib/apiClient";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from "../types";

export const authApi = {
  login: (body: LoginRequest): Promise<LoginResponse> => {
    if (import.meta.env.DEV) {
      const user: User = {
        id: "1",
        username: body.username,
        email: `${body.username}@example.com`,
        role: body.username === "admin" ? "admin" : "user",
        fullName: body.username === "admin" ? "Admin User" : "Demo User",
        department: "Engineering",
      };

      const response: LoginResponse = {
        accessToken: "dummy-access-token",
        refreshToken: "dummy-refresh-token",
        user,
      };

      return new Promise((res) => setTimeout(() => res(response), 200));
    }

    return apiClient.post("/auth/login", body).then((r) => r.data);
  },

  refresh: (body: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    if (import.meta.env.DEV) {
      return Promise.resolve({
        accessToken: "dummy-access-token",
        refreshToken: "dummy-refresh-token",
      });
    }

    return apiClient.post("/auth/refresh", body).then((r) => r.data);
  },

  me: (): Promise<User> => {
    if (import.meta.env.DEV) {
      const user: User = {
        id: "1",
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        fullName: "Admin User",
        department: "Engineering",
      };

      return Promise.resolve(user);
    }

    return apiClient.get("/auth/me").then((r) => r.data);
  },

  logout: (): Promise<void> => {
    if (import.meta.env.DEV) return Promise.resolve();
    return apiClient.post("/auth/logout").then((r) => r.data);
  },
};