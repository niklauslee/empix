/// <reference path="../.astro/types.d.ts" />

import type { getAuth } from "@/lib/auth";

type Session = ReturnType<typeof getAuth>["$Infer"]["Session"];

declare global {
  namespace App {
    interface Locals {
      user: Session["user"] | null;
      session: Session["session"] | null;
    }
  }
}
