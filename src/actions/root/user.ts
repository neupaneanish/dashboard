import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootAuthenticationClient } from "../../libs/grpc.ts";
import { gRPCToHttpError } from "../utils.ts";

export const user = defineAction({
  handler: async (id: string) => {
    const isUUID = z.uuidv7().safeParse(id).success;

    if (!isUUID) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return await rootAuthenticationClient
      .user({ id: id })
      .catch(gRPCToHttpError);
  },
});
