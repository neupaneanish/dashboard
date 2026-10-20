import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const educations = defineAction({
  handler: async (userId: string, context) => {
    const isUserId = z.uuidv7().validate(userId);
    if (!isUserId) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "User Educations not found",
      });
    }
    const res = await rootProfileClient(context)
      .educations({ userId: userId })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
    return res.educations;
  },
});
