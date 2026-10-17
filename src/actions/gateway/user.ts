import { defineAction } from "astro:actions";

import { gatewayAuthenticationClient } from "../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../utils";

export const user = defineAction({
  handler: async (_, context) => {
    return await gatewayAuthenticationClient
      .profile({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
