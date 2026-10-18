import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const domains = defineAction({
  handler: async (_, context) => {
    const res = await gatewayProfileClient
      .domains({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    return res.domains;
  },
});
