import { defineAction } from "astro:actions";

import { gatewayAuthenticationClient } from "../../../libs/grpc.ts";
import { gRPCToHttpErrorPrivate } from "../../utils.ts";

export const user = defineAction({
  handler: async (_, context) => {
    return await gatewayAuthenticationClient
      .profile({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
