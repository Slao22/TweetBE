import { User } from "@/app/models/user";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { ApiResponse } from "@/types/common";

export const login = async (
    email: string,
    password: string
): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/user/login", {
        email,
        password,
    });
    return data;
};

export const getProfile = async (): Promise<User | undefined> => {
    const { data } = await api.get<ApiResponse<User>>("/user/me");
    return data.result;
};
export const getGoogleAuthURL = async () => {
    const url = "https://accounts.google.com/o/oauth2/v2/auth";
    const query = {
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
        redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? "",
        response_type: "code",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
        prompt: "consent",
        access_type: "offline",
    };
    const queryString = new URLSearchParams(query).toString();
    return `${url}?${queryString}`;
};

export const refreshToken = async (): Promise<string> => {
    const refresh = useAuthStore.getState().refresh_token;
    if (!refresh) throw new Error("No refresh token");

    const { data } = await api.post("/auth/refresh", { refreshToken: refresh });
    const newToken = data.accessToken;

    useAuthStore.getState().setTokens(newToken, refresh);
    return newToken;
};

export const logout = () => {
    useAuthStore.getState().logout();
};
