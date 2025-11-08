import axios, { AxiosError } from "axios";
import { ApiErrorType, ApiResponse } from "@/types/common";
import { useAuthStore } from "@/store/auth.store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // 👈 Quan trọng: cookie gửi tự động
});

// 🧩 Chuẩn hóa lỗi
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

// 🧠 Auto refresh bằng cookie
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, response: any) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(response)));
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Nếu là lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // ⏳ Nếu đang refresh, chờ refresh xong rồi retry
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 🍪 Gọi refresh-token (cookie tự gửi)
                await api.post("/user/refresh-token");

                processQueue(null, null);
                return api(originalRequest); // retry lại request
            } catch (err) {
                processQueue(err, null);
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
