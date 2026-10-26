import { defineAction } from "astro:actions";

import { COOKIES_KEY_SESSION } from "../../../constants";
import { gatewayAuthenticationClient } from "../../../libs/grpc";
import { deletePrivateCookiesOnly } from "../../../utils/cookies";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const logout = defineAction({
  accept: "form",
  handler: async (_, context) => {
    await gatewayAuthenticationClient(context)
      .logout({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    deletePrivateCookiesOnly(context.cookies);
    context.cookies.delete(COOKIES_KEY_SESSION, { path: "/" });
    context.locals.user = null;
  },
});
