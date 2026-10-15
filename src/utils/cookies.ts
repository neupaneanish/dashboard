import { type Timestamp, timestampDate } from "@bufbuild/protobuf/wkt";
import type { AstroCookies } from "astro";
import type { ActionAPIContext } from "astro:actions";

import {
  COOKIES_KEY_CHANGE_EMAIL,
  COOKIES_KEY_CHANGE_PASSWORD,
  COOKIES_KEY_ENABLE_2FA,
  COOKIES_KEY_RESET_PASSWORD,
  COOKIES_KEY_SESSION_EXPIRED,
  COOKIES_KEY_SESSION_LOGOUT,
  COOKIES_KEY_SESSION_VERIFICATION,
  COOKIES_KEY_SESSION_VERIFICATION_EXPIRED,
  COOKIES_KEY_SESSION_VERIFICATION_METHOD,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
} from "../constants/cookies";

export const deletePublicCookies = (
  context: ActionAPIContext,
  value: string,
) => {
  deletePublicCookiesOnly(context);
  cookiesExpired(context, COOKIES_KEY_SESSION_EXPIRED, value);
};

export const deletePublicCookiesOnly = (context: ActionAPIContext) => {
  context.cookies.delete(COOKIES_KEY_RESET_PASSWORD, { path: "/" });
  context.cookies.delete(COOKIES_KEY_VERIFICATION, { path: "/" });
  context.cookies.delete(COOKIES_KEY_VERIFICATION_METHOD, { path: "/" });
};

export const deletePrivateCookiesOnly = (context: ActionAPIContext) => {
  context.cookies.delete(COOKIES_KEY_SESSION_VERIFICATION, { path: "/" });
  context.cookies.delete(COOKIES_KEY_SESSION_VERIFICATION_METHOD, {
    path: "/",
  });
  context.cookies.delete(COOKIES_KEY_ENABLE_2FA, { path: "/" });
  context.cookies.delete(COOKIES_KEY_CHANGE_EMAIL, { path: "/" });
  context.cookies.delete(COOKIES_KEY_CHANGE_PASSWORD, { path: "/" });
};

export const deletePrivateCookies = (context: ActionAPIContext) => {
  deletePrivateCookiesOnly(context);
  context.cookies.delete(COOKIES_KEY_SESSION_VERIFICATION_EXPIRED, {
    path: "/",
  });
  cookiesExpired(context, COOKIES_KEY_SESSION_LOGOUT, "Session Expired");
};

export const cookiesExpired = (
  context: ActionAPIContext,
  key: string,
  value: string,
) => {
  context.cookies.set(key, value, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60,
  });
};

export const setCookies = (
  context: ActionAPIContext,
  name: string,
  value: string,
  expires: Timestamp,
) => {
  context.cookies.set(name, value, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    expires: timestampDate(expires),
  });
};

export const removePublicCookies = (cookies: AstroCookies) => {
  cookies.delete(COOKIES_KEY_RESET_PASSWORD, { path: "/" });
  cookies.delete(COOKIES_KEY_VERIFICATION, { path: "/" });
  cookies.delete(COOKIES_KEY_VERIFICATION_METHOD, { path: "/" });
};
