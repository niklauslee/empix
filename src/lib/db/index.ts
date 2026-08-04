import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "./schema";

// Lazily constructed, same reasoning as `getAuth()` in `lib/auth.ts`: `env`
// is only readable once a request is being handled.
let instance: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!instance) {
    instance = drizzle(env.DB, { schema });
  }
  return instance;
}
