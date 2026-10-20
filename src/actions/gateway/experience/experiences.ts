import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const experiences = defineAction({
  handler: async (_, context) => {
    const res = await gatewayProfileClient(context)
      .experiences({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    return res.experiences;
  },
});
