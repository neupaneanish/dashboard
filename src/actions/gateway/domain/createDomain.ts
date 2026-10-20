import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  hostname: z.hostname(),
});

export const createDomain = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient(context)
      .createDomain({
        hostname: input.hostname,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
