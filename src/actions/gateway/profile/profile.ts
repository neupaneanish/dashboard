import { ActionError, defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const profile = defineAction({
  handler: async (_, context) => {
    const res = await gatewayProfileClient(context)
      .profile({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
    if (!res.profile) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    return res.profile;
  },
});
