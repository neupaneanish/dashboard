import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { rootAuthenticationClient } from "../../../libs/grpc";
import { usernameSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  id: z.uuidv7(),
  username: usernameSchema,
  updatedAt: z.date(),
});

export const updateUsername = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    return await rootAuthenticationClient(context)
      .updateUsername({
        id: input.id,
        username: {
          value: input.username,
          updatedAt: timestampFromDate(input.updatedAt),
        },
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
