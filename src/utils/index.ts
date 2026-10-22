import type { AstroCookies } from "astro";

import { COOKIES_KEY_ENABLE_2FA } from "../constants";

export interface Verification<T = string> {
  session: string;
  method: number;
  expires: T;
}

export interface EnableTwoFactor {
  session: string;
  key: string;
  uri: string;
}

export interface SessionExpired {
  success: boolean;
  title: string;
  message: string;
}

export const getExpiredMessage = (
  cookies: AstroCookies,
  key: string,
): SessionExpired | undefined => {
  const cookie: SessionExpired = cookies.get(key)?.json();

  if (
    cookie &&
    typeof cookie.success === "boolean" &&
    typeof cookie.message === "string" &&
    typeof cookie.title === "string"
  ) {
    return cookie;
  }

  return undefined;
};

export const getVerification = (
  cookies: AstroCookies,
  key: string,
): Verification | undefined => {
  const cookie: Verification | undefined = cookies.get(key)?.json();
  if (
    cookie &&
    typeof cookie.session === "string" &&
    typeof cookie.method === "number" &&
    new Date(cookie.expires).getTime() > Date.now()
  ) {
    return cookie;
  }
  return undefined;
};

export const getEnableTwoFactor = (cookies: AstroCookies) => {
  const session: EnableTwoFactor | undefined = cookies
    .get(COOKIES_KEY_ENABLE_2FA)
    ?.json();

  if (
    session &&
    typeof session.session === "string" &&
    typeof session.key === "string" &&
    typeof session.uri === "string"
  ) {
    return session;
  }
  return undefined;
};

export const setVerification = (
  cookies: AstroCookies,
  data: Verification<Date>,
  key: string,
) => {
  cookies.set(key, data, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    expires: data.expires,
  });
};
