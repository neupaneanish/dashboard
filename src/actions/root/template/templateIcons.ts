import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

export const templateIcons = defineAction({
  handler: async (_, context) => {
    const res = await rootProfileClient
      .templateIcons({})
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));
    return res.icons;
  },
});
