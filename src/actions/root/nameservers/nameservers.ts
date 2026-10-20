import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const nameservers = defineAction({
  handler: async (_, context) => {
    const res = await rootProfileClient(context)
      .nameservers({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    return res.nameservers;
  },
});
