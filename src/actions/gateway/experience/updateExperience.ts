import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { createUpdateExperienceSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  id: z.uuidv7(),
  experience: createUpdateExperienceSchema,
  updatedAt: z.coerce.date(),
});

export const updateExperience = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient
      .updateExperience({
        id: input.id,
        experience: {
          title: input.experience.title,
          companyName: input.experience.companyName,
          location: input.experience.location,
          locationType: input.experience.locationType,
          startDate: timestampFromDate(input.experience.startDate),
          endDate: input.experience.endDate
            ? timestampFromDate(input.experience.endDate)
            : input.experience.endDate,
          description: input.experience.description,
        },
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
