import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { createUpdateEducationSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const createEducation = defineAction({
  accept: "form",
  input: createUpdateEducationSchema,
  handler: async (input, context) => {
    await gatewayProfileClient
      .createEducation({
        education: {
          school: input.school,
          degree: input.degree,
          affiliation: input.affiliation,
          fieldOfStudy: input.fieldOfStudy,
          concentration: input.concentration,
          startDate: timestampFromDate(input.startDate),
          endDate: input.endDate
            ? timestampFromDate(input.endDate)
            : input.endDate,
          address: input.address,
          description: input.description,
        },
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
