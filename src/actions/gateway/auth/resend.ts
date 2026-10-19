import { timestampDate } from "@bufbuild/protobuf/wkt";
import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_VERIFICATION_SESSION } from "../../../constants";
import { gatewayAuthenticationClient } from "../../../libs/grpc";
import { PasswordVerificationMethod } from "../../../protobuf/gateway/authentication/v1/authentication_pb";
import { setVerification, type Verification } from "../../../utils";
import { deletePrivateCookiesExpire } from "../../../utils/cookies";
import {
  gRPCToHttpErrorPrivateSession,
  RemainingTimeError,
  verificationCheck,
} from "../../utils.ts";

export const resend = defineAction({
  accept: "form",
  handler: async (_, context) => {
    const { cookie, errorMessage } = verificationCheck(
      context.cookies,
      COOKIES_KEY_VERIFICATION_SESSION,
    );

    if (!(
      cookie.method === PasswordVerificationMethod.EMAIL ||
      cookie.method === PasswordVerificationMethod.ENABLED ||
      cookie.method === PasswordVerificationMethod.CHANGE
    )) {
      deletePrivateCookiesExpire(context.cookies, errorMessage);
      throw new ActionError({
        code: "PRECONDITION_FAILED",
        message: "Session Expired",
      });
    }

    RemainingTimeError(
      context.cookies,
      cookie.expires,
      errorMessage,
      COOKIES_KEY_VERIFICATION_SESSION,
    );

    const res = await gatewayAuthenticationClient
      .resend({ session: cookie.session })
      .catch((e) =>
        gRPCToHttpErrorPrivateSession(e, context.cookies, errorMessage),
      );

    if (!res.expires) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    const data: Verification<Date> = {
      session: res.session,
      method: cookie.method,
      expires: timestampDate(res.expires),
    };

    setVerification(context.cookies, data, COOKIES_KEY_VERIFICATION_SESSION);
  },
});
