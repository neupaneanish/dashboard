import { defineAction } from "astro:actions";

import { COOKIES_KEY_SESSION } from "../../constants";
import { gatewayAuthenticationClient } from "../../libs/grpc";
import { deletePrivateCookiesOnly } from "../../utils/cookies";
import { gRPCToHttpErrorPrivate } from "../utils";

export const logoutAll = defineAction({
  handler: async (_, context) => {
    await gatewayAuthenticationClient
      .logoutAll({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    deletePrivateCookiesOnly(context.cookies);
    context.cookies.delete(COOKIES_KEY_SESSION, { path: "/" });
  },
});
