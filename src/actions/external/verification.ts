import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import {
  COOKIES_KEY_RESET_PASSWORD,
  COOKIES_KEY_SESSION,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
} from "../../constants/cookies";
import { externalAuthenticationClient } from "../../libs/grpc";
import { type Verification } from "../../utils";
import {
  deletePublicCookies,
  deletePublicCookiesOnly,
  setCookies,
} from "../../utils/cookies";
import { VerificationHeading } from "../../utils/heading";
import { codeValidation } from "../../validation";
import { gRPCToHttpErrorPublic, verificationSessionCookies } from "../utils";

export const verification = defineAction({
  accept: "form",
  input: codeValidation,
  handler: async (input, context) => {
    const cookies: Verification | undefined = context.cookies
      .get(COOKIES_KEY_VERIFICATION)
      ?.json();

    if (!(cookies && cookies.session && cookies.method && cookies.expires)) {
      deletePublicCookies(context, "Verification");
      throw new ActionError({
        code: "PRECONDITION_FAILED",
        message: "Session expired",
      });
    }

    const value = VerificationHeading(cookies.method);

    const res = await externalAuthenticationClient
      .verification({
        code: {
          case: input.method,
          value: input.code,
        },
        session: cookies.session,
      })
      .catch((e) => gRPCToHttpErrorPublic(e, context, value));

    if (!res.response.value || !res.response.value.expires) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    switch (res.response.case) {
      case "session":
        deletePublicCookiesOnly(context);
        setCookies(
          context,
          COOKIES_KEY_SESSION,
          res.response.value.session,
          res.response.value.expires,
        );
        return { next: "/" };
      case "verification": {
        return verificationSessionCookies(context, res.response.value);
      }
      case "resetSession":
        deletePublicCookiesOnly(context);
        setCookies(
          context,
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
    const cookies: Verification | undefined = context.cookies
      .get(COOKIES_KEY_VERIFICATION)
      ?.json();

    if (cookies && cookies.session && cookies.method && cookies.expires) {
      return setCookies(
        context,
        COOKIES_KEY_VERIFICATION_METHOD,
        input.method,
        timestampFromDate(new Date(cookies.expires)),
      );
    }

    deletePublicCookies(context, "Verification");
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Session expired",
    });
  },
});
