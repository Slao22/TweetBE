import { AuthFooter } from "@/app/login/components/AuthFooter";
import AuthHero from "@/app/login/components/AuthHero";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen bg-black text-white">
            <AuthHero />
            <AuthFooter />
        </div>
    );
}
