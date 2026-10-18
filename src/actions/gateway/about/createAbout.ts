import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc.ts";
import { gRPCToHttpErrorPrivate } from "../../utils.ts";

const schema = z.object({
  about: z.string().min(20, "About must be at least 20 characters long"),
});

export const createAbout = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient
      .createAbout({
        about: input.about,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
