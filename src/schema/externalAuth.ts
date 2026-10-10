import { z } from "astro/zod";

import { passwordSchema } from "../validation";

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

export const resetPasswordSchema = z
  .object({
    password: passwordSchema(),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
