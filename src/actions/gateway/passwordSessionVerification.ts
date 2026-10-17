import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import {
  COOKIES_KEY_CHANGE_EMAIL,
  COOKIES_KEY_CHANGE_PASSWORD,
  COOKIES_KEY_ENABLE_2FA,
  COOKIES_KEY_VERIFICATION_SESSION,
  COOKIES_KEY_VERIFICATION_SESSION_METHOD,
} from "../../constants";
import { gatewayAuthenticationClient } from "../../libs/grpc";
import { PasswordVerificationMethod } from "../../protobuf/gateway/authentication/v1/authentication_pb";
import type { EnableTwoFactor } from "../../utils";
import {
  deletePrivateCookiesExpire,
  deletePrivateCookiesOnly,
  setCookies,
} from "../../utils/cookies";
import { codeValidation } from "../../validation";
import { gRPCToHttpErrorPrivateSession, verificationCheck } from "../utils";

export const sessionVerification = defineAction({
  accept: "form",
  input: codeValidation,
  handler: async (input, context) => {
    const { cookie, errorMessage } = verificationCheck(
      context.cookies,
      COOKIES_KEY_VERIFICATION_SESSION,
    );

    const res = await gatewayAuthenticationClient
      .passwordSessionVerification({
        session: cookie.session,
        code: {
          case: input.method,
          value: input.code,
        },
      })
      .catch((e) =>
        gRPCToHttpErrorPrivateSession(e, context.cookies, errorMessage),
      );

    switch (res.response.case) {
      case "password":
        if (!res.response.value.expires) {
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }
        deletePrivateCookiesOnly(context.cookies);
        setCookies(
          context.cookies,
          COOKIES_KEY_CHANGE_PASSWORD,
          res.response.value.session,
          res.response.value.expires,
        );
        return { next: "settings/change-password" };
      case "email":
        if (!res.response.value.expires) {
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }
        deletePrivateCookiesOnly(context.cookies);
        setCookies(
          context.cookies,
          COOKIES_KEY_CHANGE_EMAIL,
          res.response.value.session,
          res.response.value.expires,
        );
        return { next: "settings/change-email" };
      case "enableTwoFactor": {
        if (!res.response.value.expires) {
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
          });
        }
        const value: EnableTwoFactor = {
          session: res.response.value.session,
          key: res.response.value.key,
          uri: res.response.value.uri,
        };
        deletePrivateCookiesOnly(context.cookies);
        setCookies(
          context.cookies,
          COOKIES_KEY_ENABLE_2FA,
          JSON.stringify(value),
          res.response.value.expires,
        );
        return { next: "settings/enable-2fa" };
      }
      case "disabledTwoFactor":
        deletePrivateCookiesOnly(context.cookies);
        return { next: "/" };
      default:
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
    }
  },
});

export const sessionVerificationMethod = defineAction({
  accept: "form",
  input: z.object({
    method: z.enum(["totp", "recovery"]),
  }),
  handler: async (input, context) => {
    const { cookie, errorMessage } = verificationCheck(
      context.cookies,
      COOKIES_KEY_VERIFICATION_SESSION,
    );

    if (cookie.method === PasswordVerificationMethod.DISABLED) {
      return setCookies(
        context.cookies,
        COOKIES_KEY_VERIFICATION_SESSION_METHOD,
        input.method,
        timestampFromDate(new Date(cookie.expires)),
      );
    }

    deletePrivateCookiesExpire(context.cookies, errorMessage);
    throw new ActionError({
      code: "PRECONDITION_FAILED",
      message: "Session expired",
    });
  },
});
