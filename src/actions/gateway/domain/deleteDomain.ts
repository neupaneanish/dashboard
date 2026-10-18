import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  id: z.uuidv7(),
  hostname: z.hostname(),
  updatedAt: z.coerce.date(),
});

export const deleteDomain = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient
      .deleteDomain({
        id: input.id,
        hostname: input.hostname,
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
