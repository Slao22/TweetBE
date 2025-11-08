import z from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password too short"),
});

export type LoginFormSchema = z.infer<typeof loginSchema>;
