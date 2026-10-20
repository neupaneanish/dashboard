import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const domains = defineAction({
  handler: async (_, context) => {
    const res = await gatewayProfileClient(context)
      .domains({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    return res.domains;
  },
});
