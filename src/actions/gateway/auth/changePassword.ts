import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_CHANGE_PASSWORD } from "../../../constants";
import { gatewayAuthenticationClient } from "../../../libs/grpc";
import type { SessionExpired } from "../../../utils";
import {
  deletePrivateCookies,
  deletePrivateCookiesExpire,
} from "../../../utils/cookies";
import { resetChangePasswordSchema } from "../../../validation";
import { gRPCToHttpErrorPrivateSession } from "../../utils";

export const changePassword = defineAction({
  accept: "form",
  input: resetChangePasswordSchema,
  handler: async (input, context) => {
    const cookie = context.cookies.get(COOKIES_KEY_CHANGE_PASSWORD)?.value;

    const errorMessage: SessionExpired = {
      success: false,
      title: "Session Expired",
      message: `Your change password session has expired. Please start the process again.`,
    };

    if (!cookie) {
      deletePrivateCookiesExpire(context.cookies, errorMessage);
      throw new ActionError({
        code: "PRECONDITION_FAILED",
        message: "Session expired",
      });
    }

    await gatewayAuthenticationClient
      .changePassword({
        password: { value: input.password },
        confirmPassword: { value: input.confirmPassword },
        session: cookie,
      })
      .catch((e) =>
        gRPCToHttpErrorPrivateSession(e, context.cookies, errorMessage),
      );

    deletePrivateCookies(context.cookies, {
      success: true,
      title: "Change Password",
      message:
        "Your password has been changed successfully. Please log in with your new credentials.",
    });
  },
});
