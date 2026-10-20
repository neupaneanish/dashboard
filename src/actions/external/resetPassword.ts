import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_RESET_PASSWORD } from "../../constants";
import { externalAuthenticationClient } from "../../libs/grpc";
import type { SessionExpired } from "../../utils";
import { deletePublicCookies } from "../../utils/cookies";
import { resetChangePasswordSchema } from "../../validation";
import { gRPCToHttpErrorPublic } from "../utils";

export const resetPassword = defineAction({
  accept: "form",
  input: resetChangePasswordSchema,
  handler: async (input, context) => {
    const cookie = context.cookies.get(COOKIES_KEY_RESET_PASSWORD)?.value;

    const errorMessage: SessionExpired = {
      success: false,
      title: "Session Expired",
      message: "Reset password session expired, Please start from beginning",
    };

    if (!cookie) {
      deletePublicCookies(context.cookies, errorMessage);
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    await externalAuthenticationClient(context)
      .resetPassword({
        password: { value: input.password },
        confirmPassword: { value: input.confirmPassword },
        session: cookie,
      })
      .catch((e) => gRPCToHttpErrorPublic(e, context.cookies, errorMessage));
    deletePublicCookies(context.cookies, {
      success: true,
      title: "Password Reset",
      message:
        "Your password has been reset successfully. Please log in with your new credentials.",
    });
  },
});
