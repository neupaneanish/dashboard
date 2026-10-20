import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { templateDescriptionSchema, templateNameSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  iconId: z.uuidv7(),
  name: templateNameSchema,
  description: templateDescriptionSchema,
});

export const createTemplate = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await rootProfileClient(context)
      .createTemplate({
        template: {
          iconId: input.iconId,
          name: input.name,
          description: input.description,
        },
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
