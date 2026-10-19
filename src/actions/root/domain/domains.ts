import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const domains = defineAction({
  handler: async (userId: string, context) => {
    const isId = z.uuidv7().validate(userId);

    if (!isId) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "User domains not found",
      });
    }

    const res = await rootProfileClient
      .domains({
        userId: userId,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    return res.domains;
  },
});
