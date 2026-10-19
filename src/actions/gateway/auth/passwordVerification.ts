import { timestampDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_VERIFICATION_SESSION } from "../../../constants";
import { gatewayAuthenticationClient } from "../../../libs/grpc";
import { PasswordVerificationMethod } from "../../../protobuf/gateway/authentication/v1/authentication_pb";
import { setVerification, type Verification } from "../../../utils";
import { passwordValidation } from "../../../validation";
import { gRPCToHttpErrorPrivate } from "../../utils";

const schema = z.object({
  password: passwordValidation,
  method: z.enum(PasswordVerificationMethod),
});

export const passwordVerification = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await gatewayAuthenticationClient
      .passwordVerification({
        password: { value: input.password },
        method: input.method,
      })
      .catch((e) => gRPCToHttpErrorPrivate(e, context.cookies));

    if (!res.expires) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    const data: Verification<Date> = {
      session: res.session,
      method: input.method,
      expires: timestampDate(res.expires),
    };

    setVerification(context.cookies, data, COOKIES_KEY_VERIFICATION_SESSION);
    return { next: "/settings/verification" };
  },
});
