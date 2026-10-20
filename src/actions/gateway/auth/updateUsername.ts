import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayAuthenticationClient } from "../../../libs/grpc";
import { usernameSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  username: usernameSchema,
  updatedAt: z.coerce.date(),
});

export const updateUsername = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    return await gatewayAuthenticationClient(context)
      .updateUsername({
        username: {
          value: input.username,
          updatedAt: timestampFromDate(input.updatedAt),
        },
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
