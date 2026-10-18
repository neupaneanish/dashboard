import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const educations = defineAction({
  handler: async (_, context) => {
    const res = await gatewayProfileClient
      .educations({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    return res.educations;
  },
});
