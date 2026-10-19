import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const nameservers = defineAction({
  handler: async (_, context) => {
    const res = await rootProfileClient
      .nameservers({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    return res.nameservers;
  },
});
