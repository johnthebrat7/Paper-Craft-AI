import { create } from "zustand";
import type { AuthState } from "@/types";

interface AuthStore extends AuthState {
  login: (token: string, email: string, name: string, institution: string | null, roles: string[]) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  email: null,
  name: null,
  institution: null,
  roles: [],
  isAuthenticated: false,

  login: (token, email, name, institution, roles) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vedaai_token", token);
      localStorage.setItem("vedaai_user", JSON.stringify({ email, name, institution, roles }));
    }
    set({ token, email, name, institution, roles, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vedaai_token");
      localStorage.removeItem("vedaai_user");
    }
    set({ token: null, email: null, name: null, institution: null, roles: [], isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("vedaai_token");
    const userRaw = localStorage.getItem("vedaai_user");
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        set({ token, ...user, isAuthenticated: true });
      } catch {
        localStorage.removeItem("vedaai_token");
        localStorage.removeItem("vedaai_user");
      }
    }
  },
}));
