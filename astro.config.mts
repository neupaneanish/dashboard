import { defineConfig, envField } from "astro/config";

import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  env: {
    schema: {
      AUTHENTICATION_SERVICE_URL: envField.string({
        context: "server",
        access: "secret",
      }),
      PROFILE_SERVICE_URL: envField.string({
        context: "server",
        access: "secret",
      }),
      VALKEY_URL: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
});
