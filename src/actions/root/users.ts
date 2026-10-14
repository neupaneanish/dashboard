import { defineAction } from "astro:actions";

import { rootAuthenticationClient } from "../../libs/grpc.ts";
import { gRPCToHttpError } from "../utils.ts";

export const users = defineAction({
  handler: async () => {
    return await rootAuthenticationClient.users({}).catch(gRPCToHttpError);
  },
});
