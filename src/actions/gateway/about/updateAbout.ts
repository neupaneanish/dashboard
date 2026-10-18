import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc.ts";
import { gRPCToHttpErrorPrivate } from "../../utils.ts";

const schema = z.object({
  about: z.string().min(20, "About must be at least 20 characters long"),
  updatedAt: z.date(),
});

export const updateAbout = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient
      .updateAbout({
        about: input.about,
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
