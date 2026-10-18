import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const experience = defineAction({
  handler: async (id: string, context) => {
    const isUUID = z.uuidv7().safeParse(id).success;

    if (!isUUID) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Experience not found",
      });
    }

    return await gatewayProfileClient
      .experience({ id: id })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
