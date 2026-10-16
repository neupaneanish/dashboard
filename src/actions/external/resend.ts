import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_VERIFICATION_SESSION } from "../../constants";
import { externalAuthenticationClient } from "../../libs/grpc";
import {
  VerificationMethod,
  type VerificationSession,
} from "../../protobuf/external/authentication/v1/authentication_pb";
import { deletePublicCookies } from "../../utils/cookies";
import {
  gRPCToHttpErrorPublic,
  RemainingTimeError,
  verificationCheck,
  verificationSessionCookies,
} from "../utils";

export const resend = defineAction({
  accept: "form",
  handler: async (_, context) => {
    const { cookie, errorMessage } = verificationCheck(
      context.cookies,
      COOKIES_KEY_VERIFICATION_SESSION,
    );

    if (!(
      cookie.method === VerificationMethod.EMAIL ||
      cookie.method === VerificationMethod.ACCOUNT ||
      cookie.method === VerificationMethod.RESET
    )) {
      deletePublicCookies(context.cookies, errorMessage);
      throw new ActionError({
        code: "PRECONDITION_FAILED",
        message: "Session expired",
      });
    }

    RemainingTimeError(
      context.cookies,
      cookie.expires,
      errorMessage,
      COOKIES_KEY_VERIFICATION_SESSION,
    );

    const res = await externalAuthenticationClient
      .resend({ session: cookie.session })
      .catch((e) => gRPCToHttpErrorPublic(e, context.cookies, errorMessage));

    const verification: VerificationSession = {
      $typeName: "external.authentication.v1.VerificationSession",
      session: res.session,
      method: cookie.method,
      expires: res.expires,
    };

    return verificationSessionCookies(context.cookies, verification);
  },
});
