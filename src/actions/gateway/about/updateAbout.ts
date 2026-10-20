import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc.ts";
import { aboutSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils.ts";

const schema = z.object({
  about: aboutSchema,
  updatedAt: z.coerce.date(),
});

export const updateAbout = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await gatewayProfileClient(context)
      .updateAbout({
        about: input.about,
        updatedAt: timestampFromDate(input.updatedAt),
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
