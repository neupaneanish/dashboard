import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const profile = defineAction({
  handler: async (id: string, context) => {
    const isUUID = z.uuidv7().safeParse(id).success;

    if (!isUUID) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Profile not found",
      });
    }
    const res = await rootProfileClient
      .profile({ userId: id })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    if (!res.profile) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    return res.profile;
  },
});
