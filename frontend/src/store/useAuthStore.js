import { API_URL } from "@/lib/api";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const customCookieStorage = {
  getItem: (name) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    if (match) return decodeURIComponent(match[2]);
    return null;
  },
  setItem: (name, value) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  },
  removeItem: (name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const payload = { ...userData, role: userData.role || "creator" };
          const res = await fetch(`${API_URL}/auth/register.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Registration failed");

          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/auth/login.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            credentials: "include",
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Invalid credentials");

          const token = data.data?.token || null;
          const user = data.data?.user || null;

          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      fetchProfile: async () => {
        const { token } = get();

        if (!token) return;

        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/auth/me.php`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          const resData = await res.json();

          // Only logout on actual auth errors — not network blips or server errors
          if (res.status === 401 || res.status === 403) {
            get().logout();
            return;
          }

          if (!res.ok) {
            // Non-auth error: keep the session alive, just stop loading
            set({ isLoading: false });
            return;
          }

          set({
            user: resData.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Network error — do NOT logout, keep session alive
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "trustbridge-auth",
      storage: createJSONStorage(() => customCookieStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);