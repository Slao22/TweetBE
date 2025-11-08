import React from "react";
import LoginForm from "@/app/login/components/LoginForm";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { getGoogleAuthURL } from "@/services/auth.service";
export default async function AuthHero() {
    const redirectGoogleOAuth = await getGoogleAuthURL();
    return (
        <div className="flex flex-row w-full">
            {/* LEFT - Logo */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative">
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="absolute w-[380px] h-[380px] fill-white"
                >
                    <path d="M18.244 2H21l-6.682 7.637L22 22h-4.828l-4.66-6.562L6.847 22H3l7.094-8.106L2 2h4.9l4.266 6.166L18.244 2zM7.2 4.477 17.58 19.5h1.219L8.4 4.477H7.2z" />
                </svg>
            </div>

            {/* RIGHT - Content */}
            <div className="flex-1 flex flex-col px-8 lg:px-16 py-8">
                {/* Logo for mobile */}
                <div className="lg:hidden mb-8">
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="w-10 h-10 fill-white"
                    >
                        <path d="M18.244 2H21l-6.682 7.637L22 22h-4.828l-4.66-6.562L6.847 22H3l7.094-8.106L2 2h4.9l4.266 6.166L18.244 2zM7.2 4.477 17.58 19.5h1.219L8.4 4.477H7.2z" />
                    </svg>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-md">
                    <h1 className="text-6xl font-bold mb-12">Happening now</h1>
                    <h2 className="text-3xl font-bold mb-8">Join today.</h2>

                    <div className="flex flex-col space-y-3">
                        <Link href={redirectGoogleOAuth}>
                            <Button className="flex items-center justify-center gap-2 w-full bg-white text-black font-medium rounded-full px-6 py-2 hover:bg-gray-200 transition">
                                <Image
                                    src="/google.svg"
                                    alt="Google"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5"
                                />
                                Sign in with Google
                            </Button>
                        </Link>
                        <Button className="flex items-center justify-center gap-2 w-full bg-white text-black font-medium rounded-full px-6 py-2 hover:bg-gray-200 transition">
                            <Image
                                src="/apple.svg"
                                alt="Apple"
                                width={20}
                                height={20}
                                className="w-5 h-5"
                            />
                            Sign up with Apple
                        </Button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-black text-gray-400">
                                    or
                                </span>
                            </div>
                        </div>

                        <Button className="w-full bg-[#1d9bf0] text-white font-medium rounded-full px-6 py-2 hover:bg-[#1a8cd8] transition">
                            Create account
                        </Button>

                        <p className="text-xs text-gray-500 pt-1">
                            By signing up, you agree to the{" "}
                            <a
                                href="#"
                                className="text-[#1d9bf0] hover:underline"
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                href="#"
                                className="text-[#1d9bf0] hover:underline"
                            >
                                Privacy Policy
                            </a>
                            , including{" "}
                            <a
                                href="#"
                                className="text-[#1d9bf0] hover:underline"
                            >
                                Cookie Use
                            </a>
                            .
                        </p>

                        <div className="mt-16">
                            <h3 className="font-bold text-xl mb-4">
                                Already have an account?
                            </h3>
                            <LoginForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
