import { type Timestamp } from "@bufbuild/protobuf/wkt";
import { defineAction } from "astro:actions";

import { rootProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

interface DeleteDomain {
  id: string;
  userId: string;
  hostname: string;
  updatedAt: Timestamp;
}

export const deleteDomain = defineAction({
  handler: async (payload: DeleteDomain, context) => {
    await rootProfileClient(context)
      .deleteDomain({
        id: payload.id,
        userId: payload.userId,
        hostname: payload.hostname,
        updatedAt: payload.updatedAt,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
