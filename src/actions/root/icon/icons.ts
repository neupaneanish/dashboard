import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const icons = defineAction({
  handler: async (_, context) => {
    const res = await rootProfileClient(context)
      .icons({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    return res.icons;
  },
});
