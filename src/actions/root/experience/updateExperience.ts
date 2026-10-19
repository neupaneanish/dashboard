import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import {
  dateSchema,
  optionalDateSchema,
  optionalDescription,
  textSchema,
} from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z
  .object({
    id: z.uuidv7(),
    userId: z.uuidv7(),
    title: textSchema(5, 64, "Title"),
    companyName: textSchema(5, 64, "Company Name"),
    location: textSchema(3, 64, "Location"),
    locationType: z.enum(["onsite", "hybrid", "remote"]),
    startDate: dateSchema("Start Date"),
    endDate: optionalDateSchema("End Date"),
    description: optionalDescription("Description"),
    updatedAt: z.coerce.date(),
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

export const updateExperience = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await rootProfileClient
      .updateExperience({
        id: input.id,
        userId: input.userId,
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
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
