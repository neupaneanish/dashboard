import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  id: z.uuidv7(),
  templateId: z.uuidv7(),
  updatedAt: z.coerce.date(),
});

export const updateDomainTemplate = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient
      .updateDomainTemplate({
        id: input.id,
        templateId: input.templateId,
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
