import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_VERIFICATION } from "../../constants/cookies";
import { externalAuthenticationClient } from "../../libs/grpc";
import {
  VerificationMethod,
  type VerificationSession,
} from "../../protobuf/external/authentication/v1/authentication_pb";
import type { Verification } from "../../utils";
import { deletePublicCookies } from "../../utils/cookies";
import { VerificationHeading } from "../../utils/heading";
import {
  gRPCToHttpErrorPublic,
  RemainingTimeError,
  verificationSessionCookies,
} from "../utils";

export const resend = defineAction({
  accept: "form",
  handler: async (_, context) => {
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

    if (!(
      cookies.method === VerificationMethod.EMAIL ||
      cookies.method === VerificationMethod.ACCOUNT ||
      cookies.method === VerificationMethod.RESET
    )) {
      deletePublicCookies(context, value);
      throw new ActionError({
        code: "PRECONDITION_FAILED",
        message: "Session expired",
      });
    }

    RemainingTimeError(context, cookies.expires, value);

    const res = await externalAuthenticationClient
      .resend({ session: cookies.session })
      .catch((e) => gRPCToHttpErrorPublic(e, context, value));

    const verification: VerificationSession = {
      $typeName: "external.authentication.v1.VerificationSession",
      session: res.session,
      method: cookies.method,
      expires: res.expires,
    };

    return verificationSessionCookies(context, verification);
  },
});
