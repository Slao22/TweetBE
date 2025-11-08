import { LoginFormSchema } from "@/app/login/hooks/useFormResolver";
import { login } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";

const useLogin = () => {
    return useMutation({
        mutationFn: (input: LoginFormSchema) =>
            login(input.email, input.password),
        networkMode: "always",
        retry: 1,
        retryDelay: 3000,
        onError: (error) => {
            throw error;
        },
    });
};

export default useLogin;
