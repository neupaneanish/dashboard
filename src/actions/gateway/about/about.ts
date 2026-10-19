import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const about = defineAction({
  handler: async (_, context) => {
    return await gatewayProfileClient
      .about({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
