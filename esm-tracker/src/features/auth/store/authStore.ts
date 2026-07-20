import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "../types";
import { UserRole } from "../types";

import { authApi } from "../api/authApi";
import { apiClient } from "@/shared/lib/apiClient";

import { determineUserRole } from "../utils/roleUtils";

interface AuthState {
  user: User | null;
  userRole: UserRole | null;

  userId: number | null;
  personId: number | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  _cachedUser: User | null;
  rememberMe: boolean;

  setUser: (user: User | null) => void;

  signIn: (user: User, isPersistent: boolean) => Promise<void>;
  signOut: () => Promise<void>;

  getAuthenticatedUser: () => Promise<User | null>;
  checkAuth: () => Promise<boolean>;

  getUserRole: () => UserRole | null;

  loadDynamicUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userRole: null,

      userId: null,
      personId: null,

      isAuthenticated: false,
      isLoading: false,

      _cachedUser: null,
      rememberMe: false,

      setUser: (user) => {
        const role = user ? determineUserRole(user) : null;

        set({
          user,
          userRole: role,
          isAuthenticated: !!user,
          _cachedUser: user,
        });
      },

      loadDynamicUser: async () => {
        try { const currentUser = get().user; 
          if (!currentUser) 
            { console.log("No authenticated user"); return; } 
          console.log("AUTH USER:", currentUser); 
          // Change this depending on your actual user shape 
          const person = currentUser.person ?? currentUser.person ?? currentUser.id; 
          console.log("REQUEST PERSON:", person); 
          const response = await apiClient.get( "/user/dynamic", { params: { person, }, } ); 
          console.log( "DYNAMIC RESPONSE:", response.data ); 
          const dynamicUser = response.data?.[0]; 
          if (!dynamicUser) { console.log("No dynamic user found"); return; } 
          set({ 
            userId: dynamicUser.id, 
            personId: dynamicUser.person, }); 
          console.log("Stored dynamic user:", { userId: dynamicUser.id, personId: dynamicUser.person, }); } 
          catch (error) { 
            console.error( "Failed loading dynamic user:", error ); 
          }
      },

      signIn: async (
        user: User,
        isPersistent: boolean
      ) => {
        if (!user) {
          throw new Error("User is required");
        }

        const role = determineUserRole(user);
        console.log("using signin in authStore.ts", user, role);

        set({
          user,
          userRole: role,
          isAuthenticated: true,
          isLoading: false,
          _cachedUser: user,
          rememberMe: isPersistent,
        });

        if (isPersistent) {
          localStorage.setItem(
            "ems-session-persistent",
            "true"
          );

          localStorage.setItem(
            "ems-remember-me",
            "true"
          );
        } else {
          localStorage.removeItem(
            "ems-session-persistent"
          );

          localStorage.removeItem(
            "ems-remember-me"
          );
        }

        localStorage.setItem(
          "ems-user",
          JSON.stringify(user)
        );

        localStorage.setItem(
          "ems-user-role",
          role
        );

        await get().loadDynamicUser();
      },

      signOut: async () => {
        await authApi.logout();

        authApi.clearCompanyCache();

        set({
          user: null,
          userRole: null,

          userId: null,
          personId: null,

          isAuthenticated: false,
          _cachedUser: null,
          isLoading: false,
          rememberMe: false,
        });

        localStorage.removeItem(
          "ems-session-persistent"
        );

        localStorage.removeItem(
          "ems-remember-me"
        );

        localStorage.removeItem("ems-user");

        localStorage.removeItem(
          "ems-user-role"
        );
      },

      getAuthenticatedUser:
        async (): Promise<User | null> => {
          const state = get();

          if (state._cachedUser) {
            return state._cachedUser;
          }

          try {
            const storedUser =
              localStorage.getItem("ems-user");

            if (storedUser) {
              const user = JSON.parse(storedUser);

              const role =
                determineUserRole(user);

              set({
                _cachedUser: user,
                userRole: role,
              });

              return user;
            }
          } catch (error) {
            console.error(
              "Error reading stored user:",
              error
            );
          }

          return null;
        },

      checkAuth: async (): Promise<boolean> => {
        const state = get();

        if (state.isLoading) {
          return state.isAuthenticated;
        }

        const cachedUser =
          await state.getAuthenticatedUser();

        if (cachedUser) {
          const role =
            determineUserRole(cachedUser);

          const rememberMe =
            localStorage.getItem(
              "ems-remember-me"
            ) === "true";

          set({
            user: cachedUser,
            userRole: role,
            isAuthenticated: true,
            isLoading: false,
            _cachedUser: cachedUser,
            rememberMe,
          });

          await get().loadDynamicUser();

          return true;
        }

        set({
          isLoading: false,
          isAuthenticated: false,

          user: null,
          userRole: null,

          userId: null,
          personId: null,

          _cachedUser: null,
          rememberMe: false,
        });

        return false;
      },

      getUserRole: () => {
        const state = get();

        if (state.userRole) {
          return state.userRole;
        }

        if (state.user) {
          const role =
            determineUserRole(state.user);

          set({
            userRole: role,
          });

          return role;
        }

        return null;
      },
    }),
    {
      name: "ems-auth",

      partialize: (state) => ({
        user: state.user,
        userRole: state.userRole,

        userId: state.userId,
        personId: state.personId,

        isAuthenticated:
          state.isAuthenticated,

        _cachedUser: state._cachedUser,
        rememberMe: state.rememberMe,
      }),
    }
  )
);