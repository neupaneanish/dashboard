import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { gatewayAuthenticationClient } from "../../../libs/grpc";
import { getEnableTwoFactor, type SessionExpired } from "../../../utils";
import { deletePrivateCookiesExpire } from "../../../utils/cookies";
import { codeSchema } from "../../../validation";
import { gRPCToHttpErrorPrivateSession } from "../../utils";

export const enableTwoFactor = defineAction({
  accept: "form",
  input: z.object({
    code: codeSchema("totp"),
  }),
  handler: async (input, context) => {
    const cookie = getEnableTwoFactor(context.cookies);
    const errorMessage: SessionExpired = {
      success: false,
      title: "Session Expired",
      message: `Your enable 2FA session has expired. Please start the process again.`,
    };

    if (!cookie) {
      deletePrivateCookiesExpire(context.cookies, errorMessage);
      throw new ActionError({
        code: "PRECONDITION_FAILED",
        message: "Session expired",
      });
    }

    const res = await gatewayAuthenticationClient
      .confirmTwoFactor({
        session: cookie.session,
        code: input.code,
      })
      .catch((e) =>
        gRPCToHttpErrorPrivateSession(e, context.cookies, errorMessage),
      );

    return { codes: res.codes };
  },
});
