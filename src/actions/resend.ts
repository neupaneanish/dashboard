import { ActionError, defineAction } from "astro:actions";

import { externalAuthenticationClient } from "../client/grpc";
import {
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
} from "../constants/cookies";
import { gRPCToHttpError, sessionExpired, setCookies } from "./utils";

export const resend = defineAction({
  handler: async (_, context) => {
    const sessionCookies = context.cookies.get(COOKIES_KEY_VERIFICATION);
    const sessionMethodCookies = context.cookies.get(
      COOKIES_KEY_VERIFICATION_METHOD,
    );

    const session = sessionCookies?.value;
    const sessionMethod = sessionMethodCookies?.value;

    if (!session || !sessionMethod) {
      sessionExpired(context, "Verification");
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    const res = await externalAuthenticationClient
      .resend({ session: session })
      .catch(gRPCToHttpError);

    if (!res.expireAt) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    setCookies(context, COOKIES_KEY_VERIFICATION, res.session, res.expireAt);
    setCookies(
      context,
      COOKIES_KEY_VERIFICATION_METHOD,
      sessionMethod,
      res.expireAt,
    );
  },
});
