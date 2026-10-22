import { Code, ConnectError } from "@connectrpc/connect";
import { ActionError } from "astro:actions";
import { defineMiddleware } from "astro:middleware";

import { gRPCToHttpError } from "../actions/utils";
import {
  COOKIES_KEY_CHANGE_EMAIL,
  COOKIES_KEY_CHANGE_PASSWORD,
  COOKIES_KEY_ENABLE_2FA,
  COOKIES_KEY_RESET_PASSWORD,
  COOKIES_KEY_SESSION,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_SESSION,
} from "../constants";
import { gatewayAuthenticationClient } from "../libs/grpc";
import { client } from "../libs/valkey";
import { deletePrivateCookies, setCookies } from "../utils/cookies";

export const onRequest = defineMiddleware(async (context, next) => {
  const session = context.cookies.get(COOKIES_KEY_SESSION)?.value;

  if (!session) {
    context.locals.user = null;
    switch (context.url.pathname) {
      case "/verification":
        if (!context.cookies.has(COOKIES_KEY_VERIFICATION)) {
          return context.redirect("/login");
        }
        break;
      case "/reset-password":
        if (!context.cookies.has(COOKIES_KEY_RESET_PASSWORD)) {
          return context.redirect("/login");
        }
        break;
    }
    return next();
  }

  if (session) {
    switch (context.url.pathname) {
      case "/login":
      case "/forgot-password":
      case "/register":
      case "/verification":
      case "/reset-password":
        return context.redirect("/");
    }
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

  context.locals.user = {
    username: data.username,
    role: data.role,
    session: data.key,
    userID: data.user_id,
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
        userID: data.user_id,
      };
    } catch (e) {
      if (e instanceof ConnectError && e.code === Code.Unauthenticated) {
        deletePrivateCookies(context);
        return context.redirect("/login");
      }
      throw gRPCToHttpError(e);
    }
  }

  switch (context.url.pathname) {
    case "/settings/verification":
      if (!context.cookies.has(COOKIES_KEY_VERIFICATION_SESSION)) {
        return context.redirect("/");
      }
      break;
    case "/settings/change-password":
      if (!context.cookies.has(COOKIES_KEY_CHANGE_PASSWORD)) {
        return context.redirect("/");
      }
      break;
    case "/settings/change-email":
      if (!context.cookies.has(COOKIES_KEY_CHANGE_EMAIL)) {
        return context.redirect("/");
      }
      break;
    case "/settings/enable-2fa":
      if (!context.cookies.has(COOKIES_KEY_ENABLE_2FA)) {
        return context.redirect("/");
      }
      break;
  }

  return next();
});
