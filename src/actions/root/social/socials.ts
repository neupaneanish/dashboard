import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const socials = defineAction({
  handler: async (userId: string, context) => {
    if (!z.uuidv7().validate(userId)) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "User Socials not found",
      });
    }
    const res = await rootProfileClient
      .socials({ userId: userId })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    return res.socials;
  },
});
