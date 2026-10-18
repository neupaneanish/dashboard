import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { createUpdateExperienceSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const createExperience = defineAction({
  accept: "form",
  input: createUpdateExperienceSchema,
  handler: async (input, context) => {
    await gatewayProfileClient
      .createExperience({
        experience: {
          title: input.title,
          companyName: input.companyName,
          location: input.location,
          locationType: input.locationType,
          startDate: timestampFromDate(input.startDate),
          endDate: input.endDate
            ? timestampFromDate(input.endDate)
            : input.endDate,
          description: input.description,
        },
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
