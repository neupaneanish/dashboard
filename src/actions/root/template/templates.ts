import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const templates = defineAction({
  handler: async (_, context) => {
    const res = await rootProfileClient(context)
      .templates({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
    return res.templates;
  },
});
