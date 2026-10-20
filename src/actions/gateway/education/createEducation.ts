import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import {
  dateSchema,
  optionalDateSchema,
  optionalDescription,
  optionalString,
  textSchema,
} from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z
  .object({
    school: textSchema(3, 64, "School"),
    degree: textSchema(5, 64, "Degree"),
    address: textSchema(3, 64, "Address"),
    affiliation: optionalString(5, 64, "Affiliation"),
    fieldOfStudy: optionalString(5, 64, "Field of study"),
    concentration: optionalString(5, 64, "Concentration"),
    description: optionalDescription("Description"),
    startDate: dateSchema("Start Date"),
    endDate: optionalDateSchema("End Date"),
  })
  .superRefine((data, ctx) => {
    if (data.endDate) {
      const now = new Date();
      if (data.endDate > now) {
        ctx.addIssue({
          code: "custom",
          message: "End date cannot be in the future.",
          path: ["endDate"],
        });
      }
      if (data.endDate <= data.startDate) {
        ctx.addIssue({
          code: "custom",
          message: "End date must be after the start date.",
          path: ["endDate"],
        });
      }
    }
  });

export const createEducation = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient(context)
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
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
