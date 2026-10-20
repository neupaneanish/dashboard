import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { nameSchema, titleSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  userId: z.uuidv7(),
  name: nameSchema,
  title: titleSchema,
  updatedAt: z.coerce.date(),
});

export const updateProfile = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await rootProfileClient(context)
      .updateProfile({
        userId: input.userId,
        profile: {
          title: input.title,
          name: input.name,
        },
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));

    if (!res.profile) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    return res.profile;
  },
});
