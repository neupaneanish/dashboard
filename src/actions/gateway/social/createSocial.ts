import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { socialUsername } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  iconId: z.uuidv7(),
  username: socialUsername,
});

export const createSocial = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await gatewayProfileClient(context)
      .createSocial({
        iconId: input.iconId,
        username: input.username,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
