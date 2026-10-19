import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const icon = defineAction({
  handler: async (id: string, context) => {
    if (!z.uuidv7().validate(id)) {
      throw new ActionError({
        code: "NOT_FOUND",
        message: "Icon not found",
      });
    }

    return await rootProfileClient
      .icon({ id: id })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
