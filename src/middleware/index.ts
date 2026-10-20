import { Code, ConnectError } from "@connectrpc/connect";
import { ActionError } from "astro:actions";
import { defineMiddleware } from "astro:middleware";

import { gRPCToHttpError } from "../actions/utils";
import { COOKIES_KEY_SESSION } from "../constants";
import { gatewayAuthenticationClient } from "../libs/grpc";
import { client } from "../libs/valkey";
import { setCookies } from "../utils/cookies";

export const onRequest = defineMiddleware(async (context, next) => {
  const session = context.cookies.get(COOKIES_KEY_SESSION)?.value;

  if (!session) {
    context.locals.user = null;
    return next();
  }

  const data = await client.hgetall(`session:${session}`).catch((_) => {
    context.locals.user = null;
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  });

  if (!data || Object.keys(data).length === 0) {
    context.cookies.delete(COOKIES_KEY_SESSION, { path: "/" });
    context.locals.user = null;
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Session expired",
    });
  }

  context.locals.user = {
    username: data.username,
    role: data.role,
    session: data.key,
    userID: data.user_id,
  };

  const remaining = new Date(data.exat).getTime() - Date.now();

  if (remaining < 10 * 60 * 1000) {
    const res = await gatewayAuthenticationClient(context)
      .refresh({})
      .catch((e) => {
        if (e instanceof ConnectError && e.code === Code.Unauthenticated) {
          context.cookies.delete(COOKIES_KEY_SESSION, { path: "/" });
          context.locals.user = null;
        }
        throw gRPCToHttpError(e);
      });

    if (!res.expires) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Somethings went wrong",
      });
    }

    setCookies(context.cookies, COOKIES_KEY_SESSION, res.session, res.expires);
    context.locals.user = {
      session: res.session,
      username: data.username,
      role: data.role,
      userID: data.user_id,
    };
  }

  return next();
});
