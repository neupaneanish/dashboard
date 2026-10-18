import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const templates = defineAction({
  handler: async (_, context) => {
    const res = await gatewayProfileClient
      .templates({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    return res.templates;
  },
});
