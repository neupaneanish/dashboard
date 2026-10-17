import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import {
  COOKIES_KEY_RESET_PASSWORD,
  COOKIES_KEY_SESSION,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
} from "../../constants";
import { externalAuthenticationClient } from "../../libs/grpc";
import { VerificationMethod } from "../../protobuf/external/authentication/v1/authentication_pb";
import {
  deletePublicCookies,
  deletePublicCookiesOnly,
  setCookies,
} from "../../utils/cookies";
import { codeValidation } from "../../validation";
import {
  gRPCToHttpErrorPublic,
  verificationCheck,
  verificationSessionCookies,
} from "../utils";

export const verification = defineAction({
  accept: "form",
  input: codeValidation,
  handler: async (input, context) => {
    const { cookie, errorMessage } = verificationCheck(
      context.cookies,
      COOKIES_KEY_VERIFICATION,
    );

    const res = await externalAuthenticationClient
      .verification({
        code: {
          case: input.method,
          value: input.code,
        },
        session: cookie.session,
      })
      .catch((e) => gRPCToHttpErrorPublic(e, context.cookies, errorMessage));

    if (!res.response.value || !res.response.value.expires) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    switch (res.response.case) {
      case "session":
        deletePublicCookiesOnly(context.cookies);
        setCookies(
          context.cookies,
          COOKIES_KEY_SESSION,
          res.response.value.session,
          res.response.value.expires,
        );
        return { next: "/" };
      case "verification": {
        return verificationSessionCookies(context.cookies, res.response.value);
      }
      case "resetSession":
        deletePublicCookiesOnly(context.cookies);
        setCookies(
          context.cookies,
          COOKIES_KEY_RESET_PASSWORD,
          res.response.value.session,
          res.response.value.expires,
        );
        return { next: "/reset-password" };
    }
  },
});

export const verificationMethod = defineAction({
  accept: "form",
  input: z.object({
    method: z.enum(["totp", "recovery"]),
  }),
  handler: async (input, context) => {
    const { cookie, errorMessage } = verificationCheck(
      context.cookies,
      COOKIES_KEY_VERIFICATION,
    );

    if (cookie.method === VerificationMethod.TWO_FACTOR) {
      return setCookies(
        context.cookies,
        COOKIES_KEY_VERIFICATION_METHOD,
        input.method,
        timestampFromDate(new Date(cookie.expires)),
      );
    }
    deletePublicCookies(context.cookies, errorMessage);
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Session expired",
    });
  },
});
