import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { createUpdateEducationSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  id: z.uuidv7(),
  education: createUpdateEducationSchema,
  updatedAt: z.coerce.date(),
});

export const updateEducation = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient
      .updateEducation({
        id: input.id,
        education: {
          school: input.education.school,
          degree: input.education.degree,
          affiliation: input.education.affiliation,
          fieldOfStudy: input.education.fieldOfStudy,
          concentration: input.education.concentration,
          startDate: timestampFromDate(input.education.startDate),
          endDate: input.education.endDate
            ? timestampFromDate(input.education.endDate)
            : input.education.endDate,
          address: input.education.address,
          description: input.education.description,
        },
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
