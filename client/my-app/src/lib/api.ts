import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { refreshToken } from "@/services/auth.service";
import { ApiErrorType, ApiResponse } from "@/types/common";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
});

// === Attach access token before each request ===
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().access_token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 🧩 Response Interceptor – xử lý lỗi thành Error chuẩn
// 🧩 Response: format lại lỗi thành ApiErrorType
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse>) => {
        const apiError: ApiErrorType = {
            name: "ApiError",
            message:
                error.response?.data?.message ||
                error.message ||
                "Something went wrong",
            status: error.response?.status,
            errors: error.response?.data?.errors || null,
        };

        return Promise.reject(apiError);
    }
);

// === Handle 401 + refresh token queue ===
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
    refreshQueue.forEach((cb) => cb(token));
    refreshQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push((token) => {
                        if (!token) reject(error);
                        else {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        }
                    });
                });
            }

            isRefreshing = true;

            try {
                const newToken = await refreshToken();
                processQueue(newToken);
                if (!newToken) throw new Error("No token received");

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(null);
                useAuthStore.getState().logout();
                if (typeof window !== "undefined")
                    window.location.href = "/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
