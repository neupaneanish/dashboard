import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const socialIcons = defineAction({
  handler: async (_, context) => {
    const res = await gatewayProfileClient
      .socialIcons({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    return res.icons;
  },
});
