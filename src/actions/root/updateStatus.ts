import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { rootAuthenticationClient } from "../../libs/grpc";
import { gRPCToHttpError } from "../utils";

const schema = z.object({
  id: z.uuidv7(),
  status: z.enum([
    "active",
    "archived",
    "deleted",
    "disabled",
    "locked",
    "pending",
    "suspended",
  ]),
  updatedAt: z.date(),
});

export const updateStatus = defineAction({
  accept: "form",
  input: schema,
  handler: async (input) => {
    return await rootAuthenticationClient
      .updateStatus({
        id: input.id,
        status: input.status,
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch(gRPCToHttpError);
  },
});
