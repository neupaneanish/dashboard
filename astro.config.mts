import node from "@astrojs/node";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  prefetch: false,
  vite: {
    ssr: {
      noExternal: import.meta.env.PROD ? true : [],
    },
  },
  env: {
    schema: {
      AUTHENTICATION_SERVICE_URL: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      PROFILE_SERVICE_URL: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
      VALKEY_URL: envField.string({
        context: "server",
        access: "secret",
        optional: false,
      }),
    },
  },
  server: {
    host: true,
    open: true,
  },
});
