import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const nameserver = defineAction({
  handler: async (id: string, context) => {
    const isId = z.uuidv7().validate(id);

    if (!isId) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Nameserver not found",
      });
    }
    return await rootProfileClient(context)
      .nameserver({ id: id })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
