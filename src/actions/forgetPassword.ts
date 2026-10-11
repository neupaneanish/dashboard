import { z } from "astro/zod";
import { defineAction } from "astro:actions";

import { externalAuthenticationClient } from "../client/grpc";
import { gRPCToHttpError, verificationSession } from "./utils";

const schema = z.object({
  email: z.email("Enter a valid email"),
});

export const forgetPassword = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await externalAuthenticationClient
      .forgetPassword({ email: input.email })
      .catch(gRPCToHttpError);

    return verificationSession(context, res.verification);
  },
});
