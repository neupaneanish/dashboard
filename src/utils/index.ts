import type { AstroCookies } from "astro";

import {
  COOKIES_KEY_RESET,
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_METHOD,
} from "../constants/cookies";
import { VerificationMethod } from "../protobuf/external/authentication/v1/authentication_pb.ts";

export interface Verification {
  session: string;
  method: VerificationMethod;
  expires: Date;
}

export const setCookiesPage = (
  cookies: AstroCookies,
  key: string,
  value: string,
  expires: Date,
) => {
  cookies.set(key, value, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: import.meta.env.PROD,
    expires: expires,
  });
};

function isVerification(obj: unknown): obj is Verification {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "session" in obj &&
    typeof obj.session === "string" &&
    "method" in obj &&
    typeof obj.method === "number" &&
    "expires" in obj &&
    typeof obj.expires === "string"
  );
}

export function parsedVerification(json: string): Verification | null {
  try {
    const parsed = JSON.parse(json);

    if (!isVerification(parsed)) {
      return null;
    }

    return {
      session: parsed.session,
      method: parsed.method as VerificationMethod,
      expires: new Date(parsed.expires),
    };
  } catch {
    return null;
  }
}

export const deletePublicCookies = (cookies: AstroCookies) => {
  cookies.delete(COOKIES_KEY_RESET, { path: "/" });
  cookies.delete(COOKIES_KEY_VERIFICATION, { path: "/" });
  cookies.delete(COOKIES_KEY_VERIFICATION_METHOD, { path: "/" });
};
