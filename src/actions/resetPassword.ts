import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_RESET } from "../constants/cookies";
import { externalAuthenticationClient } from "../libs/grpc";
import { passwordSchema } from "../validation";
import { gRPCToHttpError, sessionExpired } from "./utils";

const schema = z
  .object({
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

export const resetPassword = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const sessionCookies = context.cookies.get(COOKIES_KEY_RESET);

    const session = sessionCookies?.value;

    if (!session) {
      sessionExpired(context, "Reset Password");
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    await externalAuthenticationClient
      .resetPassword({
        password: { value: input.password },
        confirmPassword: { value: input.confirmPassword },
        session: session,
      })
      .catch(gRPCToHttpError);
    context.cookies.delete(COOKIES_KEY_RESET, { path: "/" });
    return { next: "/login" };
  },
});
