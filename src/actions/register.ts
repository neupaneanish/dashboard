import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { externalAuthenticationClient } from "../client/grpc";
import { mobileSchema, passwordSchema } from "../validation";
import { gRPCToHttpError, verificationSession } from "./utils";

const schema = z
  .object({
    email: z.email("Enter a valid email"),
    password: z
      .string()
      .or(z.null())
      .transform((val) => val ?? "")
      .pipe(passwordSchema()),
    confirmPassword: z
      .string()
      .or(z.null())
      .transform((val) => val ?? "")
      .pipe(z.string().min(1, "Confirm Password is required")),
    username: z
      .string()
      .or(z.null())
      .transform((val) => val ?? "")
      .pipe(
        z
          .string()
          .min(1, "Username is required")
          .regex(/^[a-z]+[0-9]*$/, "Enter a valid username"),
      ),
    phone: z
      .string()
      .or(z.null())
      .transform((val) => val ?? "")
      .pipe(mobileSchema()),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const register = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await externalAuthenticationClient
      .register({
        email: input.email,
        password: { value: input.password },
        confirmPassword: { value: input.confirmPassword },
        username: input.username,
        phone: input.phone,
      })
      .catch(gRPCToHttpError);

    return verificationSession(context, res.verification);
  },
});
