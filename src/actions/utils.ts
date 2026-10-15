import { timestampDate } from "@bufbuild/protobuf/wkt";
import { Code, ConnectError } from "@connectrpc/connect";
import {
  type ActionAPIContext,
  ActionError,
  type ActionErrorCode,
} from "astro:actions";

import {
  COOKIES_KEY_SESSION_VERIFICATION_EXPIRED,
  COOKIES_KEY_VERIFICATION,
} from "../constants/cookies";
import { type VerificationSession } from "../protobuf/external/authentication/v1/authentication_pb";
import {
  cookiesExpired,
  deletePrivateCookies,
  deletePrivateCookiesOnly,
  deletePublicCookies,
  setCookies,
} from "../utils/cookies.ts";

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

export const gRPCToHttpErrorPrivate = (
  e: unknown,
  context: ActionAPIContext,
) => {
  if (e instanceof ConnectError) {
    if (e.code === Code.Unauthenticated) {
      deletePrivateCookies(context);
    }
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

export const gRPCToHttpErrorPrivateSession = (
  e: unknown,
  context: ActionAPIContext,
  value: string,
) => {
  if (e instanceof ConnectError) {
    if (e.code === Code.Unauthenticated) {
      deletePrivateCookies(context);
    }
    if (e.code === Code.FailedPrecondition) {
      deletePrivateCookiesOnly(context);
      cookiesExpired(context, COOKIES_KEY_SESSION_VERIFICATION_EXPIRED, value);
    }
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

export const gRPCToHttpErrorPublic = (
  e: unknown,
  context: ActionAPIContext,
  value: string,
) => {
  if (e instanceof ConnectError) {
    if (e.code === Code.FailedPrecondition || e.code === Code.Unauthenticated) {
      deletePublicCookies(context, value);
    }
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

  const session = {
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

export const RemainingTimeError = (
  context: ActionAPIContext,
  expires: number,
  value: string,
) => {
  const remaining = expires - Date.now();

  if (remaining < 0 || remaining > 300_000) {
    deletePublicCookies(context, value);
    throw new ActionError({
      code: "EXPECTATION_FAILED",
      message: `Session Expired`,
    });
  }

  if (remaining > 180_000) {
    const seconds = Math.ceil(remaining / 1000);
    throw new ActionError({
      code: "PRECONDITION_FAILED",
      message: `Please wait ${seconds}s before requesting a new code.`,
    });
  }
};
