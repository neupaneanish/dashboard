import { ActionError, defineAction } from "astro:actions";

import {
  COOKIES_KEY_SESSION,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
} from "../constants/cookies";
import { forgetPasswordSchema, loginSchema } from "../schema/externalAuth";
import { externalAuthenticationClient } from "../server/grpc";
import { gRPCToHttpError, setCookies } from "../utils";
import { passwordSchema } from "../validation";

export const server = {
  login: defineAction({
    accept: "form",
    input: loginSchema,
    handler: async (input, context) => {
      const result = passwordSchema().safeParse(input.password);
      if (!result.success) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: JSON.stringify({ password: ["Enter a valid password"] }),
        });
      }

      const res = await externalAuthenticationClient
        .login({
          email: input.email,
          password: { value: input.password },
        })
        .catch(gRPCToHttpError);

      switch (res.response.case) {
        case "session":
          if (!res.response.value.expireAt) {
            throw new ActionError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong",
            });
          }
          setCookies(
            context,
            COOKIES_KEY_SESSION,
            res.response.value.session,
            res.response.value.expireAt,
          );
          return { next: "/" };
        case "verification":
          if (!res.response.value.expireAt) {
            throw new ActionError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong",
            });
          }
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
  }),

  forgetPassword: defineAction({
    accept: "form",
    input: forgetPasswordSchema,
    handler: async (input, context) => {
      const res = await externalAuthenticationClient
        .forgetPassword({ email: input.email })
        .catch(gRPCToHttpError);

      if (!res.verification || !res.verification.expireAt) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }

      setCookies(
        context,
        COOKIES_KEY_VERIFICATION,
        res.verification.session,
        res.verification.expireAt,
      );
      setCookies(
        context,
        COOKIES_KEY_VERIFICATION_METHOD,
        res.verification.method.toString(),
        res.verification.expireAt,
      );
      return { next: "/verification" };
    },
  }),
};
