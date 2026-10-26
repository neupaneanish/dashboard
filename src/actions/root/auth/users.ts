import { defineAction } from "astro:actions";

import { rootAuthenticationClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const users = defineAction({
  handler: async (_, context) => {
    const res = await rootAuthenticationClient(context)
      .users({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    return res.users;
  },
});
