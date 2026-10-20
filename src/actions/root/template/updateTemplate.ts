import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { templateDescriptionSchema, templateNameSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  id: z.uuidv7(),
  iconId: z.uuidv7(),
  name: templateNameSchema,
  description: templateDescriptionSchema,
  updatedAt: z.coerce.date(),
});

export const updateTemplate = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await rootProfileClient(context)
      .updateTemplate({
        id: input.id,
        template: {
          iconId: input.iconId,
          name: input.name,
          description: input.description,
        },
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
