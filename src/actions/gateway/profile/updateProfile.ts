import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { nameSchema, titleSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils.ts";

const schema = z.object({
  name: nameSchema,
  title: titleSchema,
  updatedAt: z.date(),
});

export const updateProfile = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient
      .updateProfile({
        updatedAt: timestampFromDate(input.updatedAt),
        profile: {
          name: input.name,
          title: input.title,
        },
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
