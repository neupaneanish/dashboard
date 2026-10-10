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

export const codeSchema = (method: "totp" | "email" | "recovery") => {
  const message = "Enter a valid code";
  switch (method) {
    case "totp":
      return z.string().regex(/^\d{6}$/, message);

    case "email":
      return z.string().regex(/^[A-Z0-9]{8}$/, message);

    case "recovery":
      return z.string().regex(/^[A-Z0-9]{10}$/, message);
  }
};
