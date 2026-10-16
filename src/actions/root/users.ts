import { defineAction } from "astro:actions";

import { rootAuthenticationClient } from "../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../utils";

export const users = defineAction({
  handler: async (_, context) => {
    return await rootAuthenticationClient
      .users({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
  },
});
