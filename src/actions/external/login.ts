import { timestampDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { COOKIES_KEY_SESSION, COOKIES_KEY_VERIFICATION } from "../../constants";
import { externalAuthenticationClient } from "../../libs/grpc";
import { setVerification } from "../../utils";
import { setCookies } from "../../utils/cookies";
import { passwordValidation } from "../../validation";
import { gRPCToHttpError } from "../utils";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: passwordValidation,
});

export const login = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await externalAuthenticationClient(context)
      .login({
        email: input.email,
        password: { value: input.password },
      })
      .catch(gRPCToHttpError);

    if (!res.response.value || !res.response.value.expires) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }

    switch (res.response.case) {
      case "session":
        setCookies(
          context.cookies,
          COOKIES_KEY_SESSION,
          res.response.value.session,
          res.response.value.expires,
        );
        return { next: "/" };
      case "verification": {
        setVerification(
          context.cookies,
          {
            session: res.response.value.session,
            method: res.response.value.method,
            expires: timestampDate(res.response.value.expires),
          },
          COOKIES_KEY_VERIFICATION,
        );
        return { next: "/verification" };
      }
    }
  },
});
