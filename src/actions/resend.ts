import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_VERIFICATION } from "../constants/cookies";
import { externalAuthenticationClient } from "../libs/grpc";
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

    const remaining = cookies.expires.getTime() - new Date().getTime();

    if (remaining <= 0) {
      sessionExpired(context, "Verification");
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    // Max 5 minutes
    if (remaining > 300000) {
      sessionExpired(context, "Verification");
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }
    // Min 2 minutes
    if (remaining > 180000) {
      throw new ActionError({
        code: "PRECONDITION_FAILED",
        message: "Please wait before requesting a new code.",
      });
    }

    const res = await externalAuthenticationClient
      .resend({ session: cookies.session })
      .catch(gRPCToHttpError);

    return verificationSessionCookies(context, res.verification);
  },
});
