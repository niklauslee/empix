import { defineMiddleware } from "astro:middleware";
import { getAuth } from "@/lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const result = await getAuth().api.getSession({
    headers: context.request.headers,
  });
  context.locals.user = result?.user ?? null;
  context.locals.session = result?.session ?? null;
  return next();
});
