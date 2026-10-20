import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { type DeleteDataRoot, gRPCToHttpErrorPrivate } from "../../utils";

export const deleteEducation = defineAction({
  handler: async (payload: DeleteDataRoot, context) => {
    return await rootProfileClient(context)
      .deleteEducation({
        id: payload.id,
        userId: payload.userId,
        updatedAt: payload.updatedAt,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
