import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const domain = defineAction({
  handler: async (input: { id: string; userId: string }, context) => {
    if (!z.uuidv7().validate(input.id) || !z.uuidv7().validate(input.userId)) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Domain not found",
      });
    }

    return await rootProfileClient
      .domain({ id: input.id, userId: input.userId })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
