"use client";

import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    LoginFormSchema,
    loginSchema,
} from "@/app/login/hooks/useFormResolver";
import useLogin from "@/app/login/hooks/useLogin";
import { ApiErrorType } from "@/types/common";
import { useAuthStore } from "@/store/auth.store";
import useGetUserProfile from "@/app/login/hooks/useGetUserProfile";
import { useEffect } from "react";

export default function LoginForm() {
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<LoginFormSchema>({
        resolver: zodResolver(loginSchema),
    });
    const { setTokens, setUser } = useAuthStore();
    const { isError, isPending, mutateAsync } = useLogin();
    const { data } = useGetUserProfile();
    const onSubmit = async (data: LoginFormSchema) => {
        try {
            const res = await mutateAsync(data);
            const { accessToken, refreshToken } = res.result;
            setTokens(accessToken, refreshToken);
            window.location.href = "/home";
        } catch (error) {
            const err = error as ApiErrorType;
            console.log("❌ Login failed:", err.errors);
        }
    };
    useEffect(() => {
        if (data) setUser(data);
    }, [data]);
    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <div className="w-full border border-gray-600 text-[#1d9bf0] font-medium rounded-full px-6 py-2 hover:bg-[#1d9bf0]/10 transition">
                        Sign in
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign In</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="bg-transparent border-gray-600"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-transparent border-gray-600"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-red-400 text-sm">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {isError && (
                            <p className="text-red-400 text-sm">{isError}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-white text-black font-semibold hover:bg-gray-200"
                            disabled={isPending}
                        >
                            {isPending ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </DialogContent>
                <DialogFooter>
                    Don’t have an account?{" "}
                    <a
                        href="/register"
                        className="ml-1 text-blue-400 hover:underline"
                    >
                        Sign up
                    </a>
                </DialogFooter>
            </Dialog>
        </>
    );
}
