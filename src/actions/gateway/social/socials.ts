import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const socials = defineAction({
  handler: async (_, context) => {
    const res = await gatewayProfileClient(context)
      .socials({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    return res.socials;
  },
});
