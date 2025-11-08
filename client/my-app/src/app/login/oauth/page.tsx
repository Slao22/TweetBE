"use client";
import useGetUserProfile from "@/app/login/hooks/useGetUserProfile";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

export default function OAuth() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refetch } = useGetUserProfile();
    const { setTokens, setUser } = useAuthStore();

    useEffect(() => {
        const access_token = searchParams.get("access_token");
        const refresh_token = searchParams.get("refresh_token");

        // ✅ 1. Check token có tồn tại trước
        if (!access_token || !refresh_token) {
            router.replace("/login?error=missing_token");
            return;
        }

        // ✅ 2. Lưu token vào Zustand
        setTokens(access_token, refresh_token);

        // ✅ 3. Gọi lại API user profile
        refetch().then((res) => {
            if (res.data) {
                setUser(res.data);
                router.replace("/home");
            } else {
                router.replace("/login?error=invalid_user");
            }
        });
    }, [searchParams]);
    return <div>page</div>;
}
