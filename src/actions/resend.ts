import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_VERIFICATION } from "../constants/cookies";
import { externalAuthenticationClient } from "../libs/grpc";
import type { VerificationSession } from "../protobuf/external/authentication/v1/authentication_pb";
import { parsedVerification } from "../utils";
import {
  gRPCToHttpError,
  sessionExpired,
  verificationSessionCookies,
} from "./utils";

export const resend = defineAction({
  accept: "form",
  handler: async (_, context) => {
    const sessionCookies = context.cookies.get(COOKIES_KEY_VERIFICATION)?.value;

    if (!sessionCookies) {
      sessionExpired(context, "Verification");
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    const cookies = parsedVerification(sessionCookies);

    if (!cookies) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    const remaining = cookies.expires.getTime() - Date.now();

    if (remaining <= 0) {
      sessionExpired(context, "Verification");
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    if (!(remaining >= 0 && remaining <= 180000)) {
      if (remaining < 0 || remaining > 300000) {
        sessionExpired(context, "Verification");
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Invalid session state detected.",
        });
      }
      throw new ActionError({
        code: "PRECONDITION_FAILED",
        message: "Please wait before requesting a new code.",
      });
    }

    const res = await externalAuthenticationClient
      .resend({ session: cookies.session })
      .catch(gRPCToHttpError);

    const verification: VerificationSession = {
      $typeName: "external.authentication.v1.VerificationSession",
      expires: res.expires,
      session: res.session,
      method: cookies.method,
    };

    return verificationSessionCookies(context, verification);
  },
});
