import { Code, ConnectError } from "@connectrpc/connect";
import { ActionError } from "astro:actions";
import { defineMiddleware } from "astro:middleware";

import { gRPCToHttpError } from "../actions/utils";
import { COOKIES_KEY_SESSION } from "../constants";
import { gatewayAuthenticationClient } from "../libs/grpc";
import { client } from "../libs/valkey";
import { deletePrivateCookies, setCookies } from "../utils/cookies";

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
    deletePrivateCookies(context);
    return context.redirect("/login");
  }

  const isRoot = data.role === "root";

  context.locals.user = {
    username: data.username,
    role: data.role,
    session: data.key,
    userID: data.userID,
    isRoot: isRoot,
  };

  const remaining = new Date(data.exat).getTime() - Date.now();

  if (remaining < 10 * 60 * 1000) {
    try {
      const res = await gatewayAuthenticationClient(context).refresh({});
      setCookies(
        context.cookies,
        COOKIES_KEY_SESSION,
        res.session,
        res.expires!,
      );
      context.locals.user = {
        session: res.session,
        username: data.username,
        role: data.role,
        userID: data.userID,
        isRoot: isRoot,
      };
    } catch (e) {
      if (e instanceof ConnectError && e.code === Code.Unauthenticated) {
        deletePrivateCookies(context);
        return context.redirect("/login");
      }
      throw gRPCToHttpError(e);
    }
  }

  return next();
});
