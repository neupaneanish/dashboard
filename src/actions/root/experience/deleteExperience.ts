import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { type DeleteDataRoot, gRPCToHttpErrorPrivate } from "../../utils";

export const deleteExperience = defineAction({
  handler: async (payload: DeleteDataRoot, context) => {
    return await rootProfileClient
      .deleteExperience({
        id: payload.id,
        userId: payload.userId,
        updatedAt: payload.updatedAt,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
