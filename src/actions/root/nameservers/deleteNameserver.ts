import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { type DeleteData, gRPCToHttpErrorPrivate } from "../../utils";

export const deleteNameserver = defineAction({
  handler: async (payload: DeleteData, context) => {
    await rootProfileClient(context)
      .deleteNameserver({
        id: payload.id,
        updatedAt: payload.updatedAt,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
