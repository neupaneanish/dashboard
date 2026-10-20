import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const experiences = defineAction({
  handler: async (userId: string, context) => {
    const isUserId = z.uuidv7().validate(userId);
    if (!isUserId) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "User Experiences not found",
      });
    }
    const res = await rootProfileClient(context)
      .experiences({ userId: userId })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    return res.experiences;
  },
});
