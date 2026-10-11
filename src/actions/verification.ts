import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import { externalAuthenticationClient } from "../client/grpc";
import {
  COOKIES_KEY_RESET,
  COOKIES_KEY_SESSION,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
} from "../constants/cookies";
import { codeSchema } from "../validation";
import { gRPCToHttpError, sessionExpired, setCookies } from "./utils";

const schema = z.object({
  code: z.string().min(1, "Code is required"),
  method: z.enum(["email", "totp", "recovery"]),
});

export const verification = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const sessionCookies = context.cookies.get(COOKIES_KEY_VERIFICATION);
    const sessionMethodCookies = context.cookies.get(
      COOKIES_KEY_VERIFICATION_METHOD,
    );

    const session = sessionCookies?.value;
    const sessionMethod = sessionMethodCookies?.value;

    if (!session || !sessionMethod) {
      sessionExpired(context, "Verification");
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    const result = codeSchema(input.method).safeParse(input.code);

    if (!result.success) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: JSON.stringify({ code: ["Enter a valid code"] }),
      });
    }

    const res = await externalAuthenticationClient
      .verification({
        code: {
          case: input.method,
          value: input.code,
        },
        session: session,
      })
      .catch(gRPCToHttpError);

    if (!res.response.value || !res.response.value.expireAt) {
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
          res.response.value.expireAt,
        );
        return { next: "/" };
      case "verification":
        setCookies(
          context,
          COOKIES_KEY_VERIFICATION,
          res.response.value.session,
          res.response.value.expireAt,
        );
        setCookies(
          context,
          COOKIES_KEY_VERIFICATION_METHOD,
          res.response.value.method.toString(),
          res.response.value.expireAt,
        );
        break;
      case "resetSession":
        setCookies(
          context,
          COOKIES_KEY_RESET,
          res.response.value.session,
          res.response.value.expireAt,
        );
        return { next: "/reset-password" };
    }
  },
});
