import { createClient } from "@connectrpc/connect";
import { createGrpcTransport } from "@connectrpc/connect-node";
import {
  AUTHENTICATION_SERVICE_URL,
  PROFILE_SERVICE_URL,
} from "astro:env/server";

import { ExternalAuthenticationService } from "../protobuf/external/authentication/v1/authentication_pb";
import { GatewayAuthenticationService } from "../protobuf/gateway/authentication/v1/authentication_pb";
import { GatewayProfileService } from "../protobuf/gateway/profile/v1/profile_pb";
import { RootAuthenticationService } from "../protobuf/root/authentication/v1/authentication_pb";
import { RootProfileService } from "../protobuf/root/profile/v1/profile_pb";

const externalAuthenticationTransport = createGrpcTransport({
  baseUrl: AUTHENTICATION_SERVICE_URL,
});

const authenticationTransport = createGrpcTransport({
  baseUrl: import.meta.env.AUTHENTICATION_SERVICE_URL,
});

const profileTransport = createGrpcTransport({
  baseUrl: PROFILE_SERVICE_URL,
});

export const externalAuthenticationClient = createClient(
  ExternalAuthenticationService,
  externalAuthenticationTransport,
);

export const gatewayAuthenticationClient = createClient(
  GatewayAuthenticationService,
  authenticationTransport,
);

export const rootAuthenticationClient = createClient(
  RootAuthenticationService,
  authenticationTransport,
);

export const gatewayProfileClient = createClient(
  GatewayProfileService,
  profileTransport,
);

export const rootProfileClient = createClient(
  RootProfileService,
  profileTransport,
);
