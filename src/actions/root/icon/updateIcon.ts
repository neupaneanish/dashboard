import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import {
  iconColorSchema,
  iconNameSchema,
  iconSiteSuffixSchema,
  iconSuffixSchema,
} from "../../../schema";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  id: z.uuidv7(),
  name: iconNameSchema,
  siteHostname: z.hostname({ message: "Enter a valid site hostname" }),
  hostname: z.hostname({ message: "Enter a valid hostname" }),
  color: iconColorSchema,
  siteSuffix: iconSiteSuffixSchema,
  suffix: iconSuffixSchema,
  updatedAt: z.coerce.date(),
});

export const updateIcon = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    await rootProfileClient(context)
      .updateIcon({
        id: input.id,
        icon: {
          name: input.name,
          hostname: input.hostname,
          color: input.color,
          siteHostname: input.siteHostname,
          siteSuffix: input.siteSuffix,
          suffix: input.suffix,
        },
        updatedAt: timestampFromDate(input.updatedAt),
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
