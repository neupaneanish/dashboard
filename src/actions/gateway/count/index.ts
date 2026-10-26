import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const counts = defineAction({
  handler: async (_, context) => {
    return await gatewayProfileClient(context)
      .counts({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
