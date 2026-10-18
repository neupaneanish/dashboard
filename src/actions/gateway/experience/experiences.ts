import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const experiences = defineAction({
  handler: async (_, context) => {
    const res = await gatewayProfileClient
      .experiences({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    return res.experiences;
  },
});
