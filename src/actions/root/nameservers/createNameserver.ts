import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  cname: z
    .string()
    .nullable()
    .transform((val) => (val ? val : ""))
    .pipe(
      z
        .string()
        .min(2, "CNAME must be at least 2 characters long")
        .max(24, "CNAME must be no more than 24 characters long"),
    ),
  hostname: z.hostname({ message: "Enter a valid hostname" }),
});

export const createNameserver = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await rootProfileClient(context)
      .createNameserver({
        cname: input.cname,
        hostname: input.hostname,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
