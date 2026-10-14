import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { z } from "astro/zod";
import { ActionError, defineAction } from "astro:actions";

import {
  COOKIES_KEY_RESET,
  COOKIES_KEY_SESSION,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
} from "../../constants/cookies";
import { externalAuthenticationClient } from "../../libs/grpc.ts";
import { parsedVerification } from "../../utils";
import { codeSchema } from "../../validation";
import {
  gRPCToHttpError,
  sessionExpired,
  setCookies,
  verificationSessionCookies,
} from "../utils.ts";

const schema = z
  .object({
    code: z
      .string()
      .or(z.null())
      .transform((val) => val ?? ""),
    method: z.enum(["email", "totp", "recovery"]),
  })
  .superRefine(({ code, method }, ctx) => {
    const specializedSchema = codeSchema(method);
    const result = specializedSchema.safeParse(code);
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid code",
        path: ["code"],
      });
    }
  });

export const verification = defineAction({
  accept: "form",
  input: schema,
  handler: async (input, context) => {
    const sessionCookies = context.cookies.get(COOKIES_KEY_VERIFICATION)?.value;

    if (!sessionCookies) {
      sessionExpired(context, "Verification");
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    const cookies = parsedVerification(sessionCookies);

    if (!cookies) {
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    const res = await externalAuthenticationClient
      .verification({
        code: {
          case: input.method,
          value: input.code,
        },
        session: cookies.session,
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
        return verificationSessionCookies(context, res.response.value);
      }
      case "resetSession":
        setCookies(
          context,
          COOKIES_KEY_RESET,
          res.response.value.session,
          res.response.value.expires,
        );
        return { next: "/reset-password" };
    }
  },
});

export const verificationMethod = defineAction({
  accept: "form",
  input: z.object({
    method: z.enum(["totp", "recovery"]),
  }),
  handler: async (input, context) => {
    const sessionCookies = context.cookies.get(COOKIES_KEY_VERIFICATION)?.value;

    if (!sessionCookies) {
      sessionExpired(context, "Verification");
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }

    const cookies = parsedVerification(sessionCookies);

    if (!cookies) {
      sessionExpired(context, "Verification");
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "Session expired",
      });
    }
    setCookies(
      context,
      COOKIES_KEY_VERIFICATION_METHOD,
      input.method,
      timestampFromDate(cookies.expires),
    );
  },
});
