import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { nameSchema, titleSchema } from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  name: nameSchema,
  title: titleSchema,
  dob: z.date(),
});

export const createProfile = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await gatewayProfileClient(context)
      .createProfile({
        dob: timestampFromDate(input.dob),
        profile: {
          name: input.name,
          title: input.title,
        },
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
