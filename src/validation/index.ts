import { z } from "astro/zod";

export const passwordSchema = () => {
  return z
    .string()
    .regex(/^[\s\S]{8,64}$/, "Must be between 8 and 64 characters long")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must include at least one special character");
};
