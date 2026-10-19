import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const experience = defineAction({
  handler: async (input: { id: string; userId: string }, context) => {
    const isId = z.uuidv7().validate(input.id);
    const isUserId = z.uuidv7().validate(input.userId);

    if (!isId || !isUserId) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Experience not found",
      });
    }

    return await rootProfileClient
      .experience({ id: input.id, userId: input.userId })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
