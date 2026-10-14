import { timestampDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import {
  COOKIES_KEY_SESSION,
  COOKIES_KEY_VERIFICATION,
} from "../../constants/cookies";
import { externalAuthenticationClient } from "../../libs/grpc.ts";
import type { Verification } from "../../utils";
import { passwordValidation } from "../../validation";
import { gRPCToHttpError, setCookies } from "../utils.ts";

const schema = z.object({
  email: z.coerce
    .string()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email")),
  password: passwordValidation(),
});

export const login = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const res = await externalAuthenticationClient
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
          context,
          COOKIES_KEY_SESSION,
          res.response.value.session,
          res.response.value.expires,
        );
        return { next: "/" };
      case "verification": {
        const session: Verification = {
          session: res.response.value.session,
          method: res.response.value.method,
          expires: timestampDate(res.response.value.expires),
        };
        setCookies(
          context,
          COOKIES_KEY_VERIFICATION,
          JSON.stringify(session),
          res.response.value.expires,
        );
        return { next: "/verification" };
      }
    }
  },
});
