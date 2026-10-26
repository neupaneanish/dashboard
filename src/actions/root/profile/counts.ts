import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const counts = defineAction({
  handler: async (_, context) => {
    return await rootProfileClient(context)
      .counts({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
