// features/auth/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
import { authApi } from "../api/authApi";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _cachedUser: User | null;
  rememberMe: boolean;

  setUser: (user: User | null) => void;
  signIn: (user: User, isPersistent: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  getAuthenticatedUser: () => Promise<User | null>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _cachedUser: null,
      rememberMe: false,

      setUser: (user) => {
        console.log("setUser called with:", user);
        set({ 
          user, 
          isAuthenticated: !!user,
          _cachedUser: user 
        });
      },

      signIn: async (user: User, isPersistent: boolean) => {
        console.log("=== SIGN IN START ===");
        console.log("User:", user);
        console.log("Is Persistent:", isPersistent);
        
        if (!user) {
          console.error("User is null or undefined");
          throw new Error("User is required");
        }

        // Store the user
        console.log("Setting user in store...");
        set({ 
          user, 
          isAuthenticated: true,
          isLoading: false,
          _cachedUser: user,
          rememberMe: isPersistent
        });

        // Store session persistence preference
        if (isPersistent) {
          localStorage.setItem('ems-session-persistent', 'true');
          localStorage.setItem('ems-remember-me', 'true');
        } else {
          localStorage.removeItem('ems-session-persistent');
          localStorage.removeItem('ems-remember-me');
        }

        // Store user in localStorage for caching
        localStorage.setItem('ems-user', JSON.stringify(user));
        
        console.log("Store state after sign in:", get());
        console.log("=== SIGN IN END ===");
      },

      signOut: async () => {
        console.log("Signing out...");
        await authApi.logout();
        authApi.clearCompanyCache();
        set({
          user: null,
          isAuthenticated: false,
          _cachedUser: null,
          isLoading: false,
          rememberMe: false
        });
        localStorage.removeItem('ems-session-persistent');
        localStorage.removeItem('ems-remember-me');
        localStorage.removeItem('ems-user');
        console.log("Sign out complete");
      },

      getAuthenticatedUser: async (): Promise<User | null> => {
        const state = get();
        console.log("getAuthenticatedUser - current state:", state);
        
        if (state._cachedUser) {
          console.log("Returning cached user:", state._cachedUser);
          return state._cachedUser;
        }

        try {
          const storedUser = localStorage.getItem('ems-user');
          console.log("Stored user from localStorage:", storedUser);
          if (storedUser) {
            const user = JSON.parse(storedUser);
            set({ _cachedUser: user });
            return user;
          }
        } catch (error) {
          console.error('Error reading stored user:', error);
        }

        return null;
      },

      checkAuth: async (): Promise<boolean> => {
        console.log("=== CHECK AUTH START ===");
        const state = get();
        console.log("Current state:", state);
        
        if (state.isLoading) {
          console.log("Already loading, returning:", state.isAuthenticated);
          return state.isAuthenticated;
        }

        const cachedUser = await state.getAuthenticatedUser();
        if (cachedUser) {
          console.log("Found cached user:", cachedUser);
          const rememberMe = localStorage.getItem('ems-remember-me') === 'true';
          set({
            user: cachedUser,
            isAuthenticated: true,
            isLoading: false,
            _cachedUser: cachedUser,
            rememberMe
          });
          console.log("Auth state after setting cached user:", get());
          return true;
        }

        set({ isLoading: true });

        try {
          const user = await authApi.me();
          console.log("User from API:", user);
          
          if (user) {
            const rememberMe = localStorage.getItem('ems-remember-me') === 'true';
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              _cachedUser: user,
              rememberMe
            });
            localStorage.setItem('ems-user', JSON.stringify(user));
            console.log("Auth state after API user:", get());
            return true;
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }

        set({ 
          isLoading: false,
          isAuthenticated: false,
          user: null,
          _cachedUser: null,
          rememberMe: false
        });
        console.log("Auth state after failure:", get());
        return false;
      },
    }),
    {
      name: "ems-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        _cachedUser: state._cachedUser,
        rememberMe: state.rememberMe,
      }),
    }
  )
);