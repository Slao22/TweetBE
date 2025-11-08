import { User } from "@/app/models/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    access_token: string | null;
    refresh_token: string | null;
    user: User | null;
    setTokens: (access_token: string, refresh_token: string) => void;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            access_token: null,
            refresh_token: null,
            user: null,

            setTokens: (access_token, refresh_token) =>
                set({ access_token, refresh_token }),

            setUser: (user) => set({ user }),

            logout: () => {
                set({ access_token: null, refresh_token: null, user: null });
            },
        }),
        {
            name: "auth-storage", // key lưu trong localStorage
            partialize: (state) => ({
                access_token: state.access_token,
                refresh_token: state.refresh_token,
                user: state.user,
            }),
        }
    )
);
