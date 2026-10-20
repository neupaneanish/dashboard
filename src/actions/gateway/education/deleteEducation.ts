import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { type DeleteData, gRPCToHttpErrorPrivate } from "../../utils";

export const deleteEducation = defineAction({
  handler: async (payload: DeleteData, context) => {
    await gatewayProfileClient(context)
      .deleteEducation({
        id: payload.id,
        updatedAt: payload.updatedAt,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
