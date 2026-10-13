import { type Timestamp, timestampDate } from "@bufbuild/protobuf/wkt";
import { Code, ConnectError } from "@connectrpc/connect";
import {
  type ActionAPIContext,
  ActionError,
  type ActionErrorCode,
} from "astro:actions";

import {
  COOKIES_KEY_SESSION_EXPIRED,
  COOKIES_KEY_VERIFICATION,
} from "../constants/cookies";
import { type VerificationSession } from "../protobuf/external/authentication/v1/authentication_pb";
import type { Verification } from "../utils";

export const setCookies = (
  context: ActionAPIContext,
  name: string,
  value: string,
  expireAt: Timestamp,
) => {
  context.cookies.set(name, value, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    expires: timestampDate(expireAt),
  });
};

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
      message: e.rawMessage,
    });
  } else {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    });
  }
};

export const sessionExpired = (context: ActionAPIContext, page: string) => {
  context.cookies.set(COOKIES_KEY_SESSION_EXPIRED, page, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    expires: new Date(Date.now() + 60000),
  });
};

export const verificationSession = (
  context: ActionAPIContext,
  verification: VerificationSession | undefined,
) => {
  verificationSessionCookies(context, verification);
  return { next: "/verification" };
};

export const verificationSessionCookies = (
  context: ActionAPIContext,
  verification: VerificationSession | undefined,
) => {
  if (!verification || !verification.expires) {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    });
  }

  const session: Verification = {
    session: verification.session,
    method: verification.method,
    expires: timestampDate(verification.expires),
  };

  setCookies(
    context,
    COOKIES_KEY_VERIFICATION,
    JSON.stringify(session),
    verification.expires,
  );
};
