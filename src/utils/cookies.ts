import { type Timestamp, timestampDate } from "@bufbuild/protobuf/wkt";
import type { AstroCookies } from "astro";

import {
  COOKIES_KEY_CHANGE_EMAIL,
  COOKIES_KEY_CHANGE_PASSWORD,
  COOKIES_KEY_ENABLE_2FA,
  COOKIES_KEY_RESET_PASSWORD,
  COOKIES_KEY_SESSION,
  COOKIES_KEY_SESSION_EXPIRED,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
  COOKIES_KEY_VERIFICATION_SESSION,
  COOKIES_KEY_VERIFICATION_SESSION_METHOD,
} from "../constants";
import type { SessionExpired } from ".";

export const deletePublicCookiesOnly = (cookies: AstroCookies) => {
  cookies.delete(COOKIES_KEY_RESET_PASSWORD, { path: "/" });
  cookies.delete(COOKIES_KEY_VERIFICATION, { path: "/" });
  cookies.delete(COOKIES_KEY_VERIFICATION_METHOD, { path: "/" });
};

export const deletePublicCookies = (
  cookies: AstroCookies,
  data: SessionExpired,
) => {
  deletePublicCookiesOnly(cookies);
  setExpiredMessage(cookies, data);
};

export const deletePrivateCookiesOnly = (cookies: AstroCookies) => {
  cookies.delete(COOKIES_KEY_VERIFICATION_SESSION, { path: "/" });
  cookies.delete(COOKIES_KEY_VERIFICATION_SESSION_METHOD, { path: "/" });
  cookies.delete(COOKIES_KEY_CHANGE_EMAIL, { path: "/" });
  cookies.delete(COOKIES_KEY_CHANGE_PASSWORD, { path: "/" });
  cookies.delete(COOKIES_KEY_ENABLE_2FA, { path: "/" });
};

export const deletePrivateCookiesExpire = (
  cookies: AstroCookies,
  value: SessionExpired,
) => {
  deletePrivateCookiesOnly(cookies);
  setExpiredMessage(cookies, value);
};

export const deletePrivateCookies = (
  cookies: AstroCookies,
  value?: SessionExpired,
) => {
  deletePrivateCookiesOnly(cookies);
  cookies.delete(COOKIES_KEY_SESSION, { path: "/" });
  setExpiredMessage(
    cookies,
    value
      ? value
      : {
          success: false,
          title: "Session Expired",
          message: "Your session has timed out. Please log in again.",
        },
  );
};

export const setCookies = (
  cookies: AstroCookies,
  name: string,
  value: string,
  expires: Timestamp,
) => {
  cookies.set(name, value, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    expires: timestampDate(expires),
  });
};

export const setExpiredMessage = (
  cookies: AstroCookies,
  data: SessionExpired,
) => {
  cookies.set(COOKIES_KEY_SESSION_EXPIRED, data, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    maxAge: 60,
  });
};
