import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc.ts";
import { gRPCToHttpErrorPrivate } from "../../utils.ts";

const schema = z.object({
  id: z.uuidv7(),
  updatedAt: z.coerce.date(),
});

export const deleteEducation = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient
      .deleteEducation({
        id: input.id,
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
