import { type Timestamp } from "@bufbuild/protobuf/wkt";
import { defineAction } from "astro:actions";

import { gatewayProfileClient } from "../../../libs/grpc";
import { gRPCToHttpErrorPrivate } from "../../utils";

interface VerifyDomain {
  id: string;
  hostname: string;
  txt: string;
  updatedAt: Timestamp;
}

export const verifyDomain = defineAction({
  handler: async (payload: VerifyDomain, context) => {
    await gatewayProfileClient(context)
      .verifyDomain({
        id: payload.id,
        txt: payload.txt,
        hostname: payload.hostname,
        updatedAt: payload.updatedAt,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context));
  },
});
