import { type Timestamp, timestampDate } from "@bufbuild/protobuf/wkt";
import { Code, ConnectError } from "@connectrpc/connect";
import type { AstroCookies } from "astro";
import {
  type ActionAPIContext,
  ActionError,
  type ActionErrorCode,
} from "astro:actions";

import {
  COOKIES_KEY_VERIFICATION,
  COOKIES_KEY_VERIFICATION_SESSION,
} from "../constants";
import { type VerificationSession } from "../protobuf/external/authentication/v1/authentication_pb";
import {
  getVerification,
  type SessionExpired,
  setVerification,
} from "../utils";
import {
  deletePrivateCookies,
  deletePrivateCookiesExpire,
  deletePublicCookies,
} from "../utils/cookies";
import {
  PasswordVerificationHeading,
  VerificationHeading,
} from "../utils/heading";

const gRPCCode = (code: Code): ActionErrorCode => {
  switch (code) {
    case Code.Canceled:
      return "BAD_REQUEST";
    case Code.Unknown:
      return "INTERNAL_SERVER_ERROR";
    case Code.InvalidArgument:
      return "BAD_REQUEST";
    case Code.DeadlineExceeded:
      return "GATEWAY_TIMEOUT";
    case Code.NotFound:
      return "NOT_FOUND";
    case Code.AlreadyExists:
      return "CONFLICT";
    case Code.PermissionDenied:
      return "FORBIDDEN";
    case Code.ResourceExhausted:
      return "TOO_MANY_REQUESTS";
    case Code.FailedPrecondition:
      return "PRECONDITION_FAILED";
    case Code.Aborted:
      return "EXPECTATION_FAILED";
    case Code.OutOfRange:
      return "BAD_REQUEST";
    case Code.Unimplemented:
      return "NOT_IMPLEMENTED";
    case Code.Internal:
      return "INTERNAL_SERVER_ERROR";
    case Code.Unavailable:
      return "SERVICE_UNAVAILABLE";
    case Code.DataLoss:
      return "INTERNAL_SERVER_ERROR";
    case Code.Unauthenticated:
      return "UNAUTHORIZED";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
};

export const gRPCToHttpError = (e: unknown) => {
  if (e instanceof ConnectError) {
    throw new ActionError({
      code: gRPCCode(e.code),
      message: e.rawMessage || "Something went wrong",
    });
  } else {
    if (e instanceof Error) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: e.message || "Something went wrong",
      });
    }
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

export const gRPCToHttpErrorPublic = (
  e: unknown,
  cookies: AstroCookies,
  value: SessionExpired,
) => {
  if (
    e instanceof ConnectError &&
    (e.code === Code.Aborted || e.code === Code.Unauthenticated)
  ) {
    deletePublicCookies(cookies, value);
  }
  throw gRPCToHttpError(e);
};

export const gRPCToHttpErrorPrivateSession = (
  e: unknown,
  context: ActionAPIContext,
  value: SessionExpired,
) => {
  if (e instanceof ConnectError) {
    switch (e.code) {
      case Code.FailedPrecondition:
        deletePrivateCookiesExpire(context.cookies, value);
        break;
      case Code.Unauthenticated:
        deletePrivateCookies(context);
        break;
    }
  }
  throw gRPCToHttpError(e);
};

export const gRPCToHttpErrorPrivate = (
  e: unknown,
  context: ActionAPIContext,
) => {
  if (e instanceof ConnectError && e.code === Code.Unauthenticated) {
    deletePrivateCookies(context);
  }
  throw gRPCToHttpError(e);
};

export const verificationSession = (
  cookies: AstroCookies,
  verification: VerificationSession | undefined,
) => {
  verificationSessionCookies(cookies, verification);
  return { next: "/verification" };
};

export const verificationSessionCookies = (
  cookies: AstroCookies,
  verification: VerificationSession | undefined,
) => {
  if (!verification || !verification.expires) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    });
  }

  setVerification(
    cookies,
    {
      session: verification.session,
      method: verification.method,
      expires: timestampDate(verification.expires),
    },
    COOKIES_KEY_VERIFICATION,
  );
};

export const RemainingTimeError = (
  cookies: AstroCookies,
  expires: string,
  value: SessionExpired,
  key: string,
) => {
  const remaining = new Date(expires).getTime() - Date.now();

  if (remaining > 300_000) {
    switch (key) {
      case COOKIES_KEY_VERIFICATION:
        deletePublicCookies(cookies, value);
        break;
      case COOKIES_KEY_VERIFICATION_SESSION:
        deletePrivateCookiesExpire(cookies, value);
        break;
    }
    throw new ActionError({
      code: "EXPECTATION_FAILED",
      message: `Session Expired`,
    });
  }

  if (remaining > 180_000) {
    const seconds = Math.ceil((remaining - 180_000) / 1000);
    throw new ActionError({
      code: "PRECONDITION_FAILED",
      message: `Please wait ${seconds}s before requesting a new code.`,
    });
  }
};

export const verificationCheck = (cookies: AstroCookies, key: string) => {
  const cookie = getVerification(cookies, key);

  if (!cookie) {
    const errorMessage = {
      success: false,
      title: "Session Expired",
      message:
        "Your verification session has expired. Please start the process again.",
    };
    switch (key) {
      case COOKIES_KEY_VERIFICATION_SESSION:
        deletePrivateCookiesExpire(cookies, errorMessage);
        break;
      case COOKIES_KEY_VERIFICATION:
        deletePublicCookies(cookies, errorMessage);
        break;
    }

    throw new ActionError({
      code: "PRECONDITION_FAILED",
      message: "Session expired",
    });
  }

  let value: string = "";

  switch (key) {
    case COOKIES_KEY_VERIFICATION_SESSION:
      value = PasswordVerificationHeading(cookie.method);
      break;
    case COOKIES_KEY_VERIFICATION:
      value = VerificationHeading(cookie.method);
      break;
  }
  const errorMessage: SessionExpired = {
    success: false,
    title: "Session Expired",
    message: `Your ${value.toLocaleLowerCase()} session has expired. Please start the process again.`,
  };

  return { cookie, errorMessage };
};

export interface DeleteData {
  id: string;
  updatedAt: Timestamp;
}

export interface DeleteDataRoot extends DeleteData {
  userId: string;
}
