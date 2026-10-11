import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { externalAuthenticationClient } from "../client/grpc";
import { mobileSchema, passwordSchema } from "../validation";
import { gRPCToHttpError } from "./utils";
import { verificationSession } from "./utils";

const schema = z
  .object({
    email: z.email("Enter a valid email").min(1, "Email is required"),
    password: passwordSchema(),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
    username: z
      .string()
      .min(1, "Username is required")
      .regex(/^[a-z]+[0-9]*$/, "Enter a valid username"),
    phone: mobileSchema(),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
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
