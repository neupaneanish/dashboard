import { defineAction } from "astro:actions";

import { rootAuthenticationClient } from "../../../libs/grpc.ts";
import { gRPCToHttpErrorPrivate } from "../../utils.ts";

export const users = defineAction({
  handler: async (_, context) => {
    return await rootAuthenticationClient
      .users({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
