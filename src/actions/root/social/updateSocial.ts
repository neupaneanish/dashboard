import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { socialUsername } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  id: z.uuidv7(),
  userId: z.uuidv7(),
  username: socialUsername,
  updatedAt: z.coerce.date(),
});

export const updateSocial = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await rootProfileClient(context)
      .updateSocial({
        userId: input.userId,
        social: {
          id: input.id,
          username: input.username,
          updatedAt: timestampFromDate(input.updatedAt),
        },
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
