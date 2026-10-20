import {
  Code,
  ConnectError,
  createClient,
  type Interceptor,
} from "@connectrpc/connect";
import { createGrpcTransport } from "@connectrpc/connect-node";
import { type ActionAPIContext } from "astro:actions";
import {
  AUTHENTICATION_SERVICE_URL,
  PROFILE_SERVICE_URL,
} from "astro:env/server";

import { ExternalAuthenticationService } from "../protobuf/external/authentication/v1/authentication_pb";
import { GatewayAuthenticationService } from "../protobuf/gateway/authentication/v1/authentication_pb";
import { GatewayProfileService } from "../protobuf/gateway/profile/v1/profile_pb.ts";
import { RootAuthenticationService } from "../protobuf/root/authentication/v1/authentication_pb";
import { RootProfileService } from "../protobuf/root/profile/v1/profile_pb";

const externalAuthenticationTransport = (context: ActionAPIContext) =>
  createGrpcTransport({
    baseUrl: AUTHENTICATION_SERVICE_URL,
    interceptors: [publicInterceptor(context)],
  });

const authenticationTransport = (
  context: ActionAPIContext,
  role?: "root" | "user",
) =>
  createGrpcTransport({
    baseUrl: AUTHENTICATION_SERVICE_URL,
    interceptors: [authInterceptor(context, role)],
  });

const profileTransport = (context: ActionAPIContext, role: "root" | "user") =>
  createGrpcTransport({
    baseUrl: PROFILE_SERVICE_URL,
    interceptors: [authInterceptor(context, role)],
  });

export const externalAuthenticationClient = (context: ActionAPIContext) =>
  createClient(
    ExternalAuthenticationService,
    externalAuthenticationTransport(context),
  );

export const gatewayAuthenticationClient = (context: ActionAPIContext) =>
  createClient(GatewayAuthenticationService, authenticationTransport(context));

export const rootAuthenticationClient = (context: ActionAPIContext) =>
  createClient(
    RootAuthenticationService,
    authenticationTransport(context, "root"),
  );

export const gatewayProfileClient = (context: ActionAPIContext) =>
  createClient(GatewayProfileService, profileTransport(context, "user"));

export const rootProfileClient = (context: ActionAPIContext) =>
  createClient(RootProfileService, profileTransport(context, "root"));

const authInterceptor = (
  context: ActionAPIContext,
  role?: "root" | "user",
): Interceptor => {
  return (next) => async (req) => {
    const user = context.locals.user;

    if (!user) {
      throw new ConnectError("Session expired", Code.Unauthenticated);
    }

    if (role && role != user.role) {
      throw new ConnectError("Permission denied", Code.PermissionDenied);
    }

    req.header.set("x-session", user.session);
    req.header.set("x-user-id", user.userID);
    req.header.set("x-role", user.role);
    req.header.set("x-username", user.username);

    return await next(req);
  };
};

const publicInterceptor = (context: ActionAPIContext): Interceptor => {
  return (next) => async (req) => {
    const user = context.locals.user;

    if (user) {
      throw new ConnectError("Permission Denied", Code.PermissionDenied);
    }
    return await next(req);
  };
};
