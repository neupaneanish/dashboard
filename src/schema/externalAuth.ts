import { z } from "astro/zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgetPasswordSchema = z.object({
  email: z.email("Enter a valid email").min(1, "Email is required"),
});

export const verificationSchema = z.object({
  code: z.string().min(1, "Code is required"),
  method: z.enum(["email", "totp", "recovery"]),
});
