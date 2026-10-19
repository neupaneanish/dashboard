import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { type DeleteData, gRPCToHttpErrorPrivate } from "../../utils";

export const deleteTemplate = defineAction({
  handler: async (payload: DeleteData, context) => {
    await rootProfileClient
      .deleteTemplate({
        id: payload.id,
        updatedAt: payload.updatedAt,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
