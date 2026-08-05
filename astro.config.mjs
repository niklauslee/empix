// @ts-check
import { defineConfig, sessionDrivers } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react()],
  adapter: cloudflare(),
  // We don't use Astro's session API (auth sessions are handled by
  // better-auth via D1), so opt out of the Cloudflare adapter's default
  // behavior of auto-provisioning a "SESSION" KV binding/namespace.
  session: {
    driver: sessionDrivers.lruCache(),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
