import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { aboutSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  userId: z.uuidv7(),
  about: aboutSchema,
  updatedAt: z.coerce.date(),
});

export const updateAbout = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await rootProfileClient
      .updateAbout({
        userId: input.userId,
        about: input.about,
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    if (!res.about) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    return res.about;
  },
});
