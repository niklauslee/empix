import type { APIRoute } from "astro";
import { getAuth } from "@/lib/auth";

export const ALL: APIRoute = (ctx) => getAuth().handler(ctx.request);
