import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const socialIcons = defineAction({
  handler: async (_, context) => {
    const res = await gatewayProfileClient(context)
      .socialIcons({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    return res.icons;
  },
});
