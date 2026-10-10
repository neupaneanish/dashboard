import { ActionError, defineAction } from "astro:actions";

import {
  COOKIES_KEY_RESET,
  COOKIES_KEY_SESSION,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
} from "../constants/cookies";
import {
  forgetPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  verificationSchema,
} from "../schema/externalAuth";
import { externalAuthenticationClient } from "../server/grpc";
import { gRPCToHttpError, setCookies } from "../utils";
import { codeSchema, passwordSchema } from "../validation";

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

  verification: defineAction({
    accept: "form",
    input: verificationSchema,
    handler: async (input, context) => {
      const sessionCookies = context.cookies.get(COOKIES_KEY_VERIFICATION);
      const sessionMethodCookies = context.cookies.get(
        COOKIES_KEY_VERIFICATION_METHOD,
      );

      const session = sessionCookies?.value;
      const sessionMethod = sessionMethodCookies?.value;

      if (!session || !sessionMethod) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Session expired",
        });
      }

      const result = codeSchema(input.method).safeParse(input.code);

      if (!result.success) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: JSON.stringify({ code: ["Enter a valid code"] }),
        });
      }

      const res = await externalAuthenticationClient
        .verification({
          code: {
            case: input.method,
            value: input.code,
          },
          session: session,
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
        case "resetSession":
          setCookies(
            context,
            COOKIES_KEY_RESET,
            res.response.value.session,
            res.response.value.expireAt,
          );
          return { next: "/reset-password" };
      }
    },
  }),

  resetPassword: defineAction({
    accept: "form",
    input: resetPasswordSchema,
    handler: async (input, context) => {
      const sessionCookies = context.cookies.get(COOKIES_KEY_RESET);

      const session = sessionCookies?.value;

      if (!session) {
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
  }),
};
