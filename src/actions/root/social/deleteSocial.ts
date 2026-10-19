import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { type DeleteDataRoot, gRPCToHttpErrorPrivate } from "../../utils";

export const deleteSocial = defineAction({
  handler: async (payload: DeleteDataRoot, context) => {
    return await rootProfileClient
      .deleteSocial({
        id: payload.id,
        userId: payload.userId,
        updatedAt: payload.updatedAt,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
