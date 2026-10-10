import type { Timestamp } from "@bufbuild/protobuf/wkt";
import { Code, ConnectError } from "@connectrpc/connect";
import {
  type ActionAPIContext,
  ActionError,
  type ActionErrorCode,
} from "astro:actions";

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
    expires: new Date(Number(expireAt.seconds) * 1000),
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
  context.cookies.set("session-expired", "true", {
    path: "/",
    httpOnly: false,
    sameSite: "strict",
    maxAge: 60,
  });
  context.cookies.set("session-expired-message", page, {
    path: "/",
    httpOnly: false,
    sameSite: "strict",
    maxAge: 60,
  });
};
