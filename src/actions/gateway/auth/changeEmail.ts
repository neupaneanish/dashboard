import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_CHANGE_EMAIL } from "../../../constants";
import { gatewayAuthenticationClient } from "../../../libs/grpc.ts";
import type { SessionExpired } from "../../../utils";
import {
  deletePrivateCookies,
  deletePrivateCookiesExpire,
} from "../../../utils/cookies.ts";
import { gRPCToHttpErrorPrivateSession } from "../../utils";

const schema = z.object({
  email: z.email("Enter a valid email"),
});

export const changeEmail = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const session = context.cookies.get(COOKIES_KEY_CHANGE_EMAIL)?.value;

    const errorMessage: SessionExpired = {
      success: false,
      title: "Session Expired",
      message: `Your change email session has expired. Please start the process again.`,
    };

    if (!session) {
      deletePrivateCookiesExpire(context.cookies, errorMessage);
      throw new ActionError({
        code: "PRECONDITION_FAILED",
        message: "Session expired",
      });
    }

    await gatewayAuthenticationClient
      .changeEmail({ email: input.email, session: session })
      .catch((e) =>
        gRPCToHttpErrorPrivateSession(e, context.cookies, errorMessage),
      );

    deletePrivateCookies(context.cookies, {
      success: true,
      title: "Change Email",
      message:
        "Your email has been changed successfully. Please log in with your new email.",
    });
  },
});
