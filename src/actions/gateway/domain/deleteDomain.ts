import { type Timestamp } from "@bufbuild/protobuf/wkt";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

interface DeleteDomain {
  id: string;
  hostname: string;
  updatedAt: Timestamp;
}

export const deleteDomain = defineAction({
  handler: async (payload: DeleteDomain, context) => {
    await gatewayProfileClient(context)
      .deleteDomain({
        id: payload.id,
        hostname: payload.hostname,
        updatedAt: payload.updatedAt,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
