import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const profile = defineAction({
  handler: async (_, context) => {
    await gatewayProfileClient
      .profile({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
