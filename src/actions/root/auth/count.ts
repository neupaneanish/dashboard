import { defineAction } from "astro:actions";

import { rootAuthenticationClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const count = defineAction({
  handler: async (_, context) => {
    return await rootAuthenticationClient(context)
      .counts({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
