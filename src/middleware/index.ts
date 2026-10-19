import { defineMiddleware } from "astro:middleware";

import { valkey } from "../libs/valkey";

const valkeyClient = await valkey();

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.valkey = valkeyClient;

  return next();
});
