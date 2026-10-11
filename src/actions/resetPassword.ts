import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { externalAuthenticationClient } from "../client/grpc";
import { COOKIES_KEY_RESET } from "../constants/cookies";
import { passwordSchema } from "../validation";
import { gRPCToHttpError, sessionExpired } from "./utils";

const schema = z
  .object({
    password: passwordSchema(),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
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
