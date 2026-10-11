import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { externalAuthenticationClient } from "../client/grpc";
import {
  COOKIES_KEY_SESSION,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
} from "../constants/cookies";
import { passwordSchema } from "../validation";
import { gRPCToHttpError, setCookies } from "./utils";

const schema = z.object({
  email: z.coerce
    .string()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email")),
  password: z
    .string()
    .or(z.null())
    .transform((val) => val ?? "")
    .pipe(
      z
        .string()
        .min(1, "Password is required")
        .pipe(
          z.string().superRefine((val, ctx) => {
            const isValid = passwordSchema().safeParse(val).success;
            if (!isValid) {
              ctx.addIssue({
                code: "custom",
                message: "Enter a valid password",
                fatal: true,
              });
            }
          }),
        ),
    ),
});

export const login = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await externalAuthenticationClient
      .login({
        email: input.email,
        password: { value: input.password },
      })
      .catch(gRPCToHttpError);

    if (!res.response.value || !res.response.value.expireAt) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    switch (res.response.case) {
      case "session":
        setCookies(
          context,
          COOKIES_KEY_SESSION,
          res.response.value.session,
          res.response.value.expireAt,
        );
        return { next: "/" };
      case "verification":
        setCookies(
          context,
          COOKIES_KEY_VERIFICATION,
          res.response.value.session,
          res.response.value.expireAt,
        );
        setCookies(
          context,
          COOKIES_KEY_VERIFICATION_METHOD,
          res.response.value.method.toString(),
          res.response.value.expireAt,
        );
        return { next: "/verification" };
    }
  },
});
