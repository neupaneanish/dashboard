import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { rootAuthenticationClient } from "../../../libs/grpc.ts";
import { gRPCToHttpErrorPrivate } from "../../utils.ts";

const schema = z.object({
  id: z.uuidv7(),
  role: z.enum(["root", "user"]),
  updatedAt: z.date(),
});

export const updateRole = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    return await rootAuthenticationClient
      .updateRole({
        id: input.id,
        role: input.role,
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
