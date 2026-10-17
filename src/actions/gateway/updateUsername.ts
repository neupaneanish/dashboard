import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { rootAuthenticationClient } from "../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../utils";

const schema = z.object({
  username: z
    .string()
    .or(z.null())
    .transform((val) => val ?? "")
    .pipe(
      z
        .string()
        .min(1, "Username is required")
        .regex(/^[a-z]+[0-9]*$/, "Enter a valid username"),
    ),
  updatedAt: z.date(),
});

export const updateUsername = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    return await rootAuthenticationClient
      .updateUsername({
        username: {
          value: input.username,
          updatedAt: timestampFromDate(input.updatedAt),
        },
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
