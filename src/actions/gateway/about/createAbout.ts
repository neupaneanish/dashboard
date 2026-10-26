import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { aboutSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  about: aboutSchema,
});

export const createAbout = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await gatewayProfileClient(context)
      .createAbout({
        about: input.about,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    if (!res.about) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    return res.about;
  },
});
