import { defineAction } from "astro:actions";

import { COOKIES_KEY_SESSION } from "../../../constants";
import { gatewayAuthenticationClient } from "../../../libs/grpc.ts";
import { deletePrivateCookiesOnly } from "../../../utils/cookies.ts";
import { gRPCToHttpErrorPrivate } from "../../utils.ts";

export const logoutAll = defineAction({
  handler: async (_, context) => {
    await gatewayAuthenticationClient
      .logoutAll({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    deletePrivateCookiesOnly(context.cookies);
    context.cookies.delete(COOKIES_KEY_SESSION, { path: "/" });
  },
});
