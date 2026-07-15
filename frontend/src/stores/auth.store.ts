import { create } from "zustand";

import type { AuthUser } from "../features/auth/types/auth.types";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isInitialized: boolean;

  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  finishInitialization: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,

  setSession: (user, accessToken) => {
    set({
      user,
      accessToken,
    });
  },

  setAccessToken: (accessToken) => {
    set({
      accessToken,
    });
  },

  clearSession: () => {
    set({
      user: null,
      accessToken: null,
    });
  },

  finishInitialization: () => {
    set({
      isInitialized: true,
    });
  },
}));
