import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { iconSet } from "@/lib/db/schema";
import {
  compressIconSetData,
  decompressIconSetData,
  parseIconSetData,
} from "@/lib/db/icon-sets";

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const [row] = await getDb()
    .select()
    .from(iconSet)
    .where(and(eq(iconSet.id, params.id!), eq(iconSet.userId, user.id)));
  if (!row) return new Response("Not found", { status: 404 });

  return Response.json({ ...row, data: decompressIconSetData(row.data) });
};

export const PATCH: APIRoute = async ({ params, locals, request }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json()) as { name?: unknown; data?: unknown };
  const changes: {
    name?: string;
    data?: Buffer;
    width?: number;
    height?: number;
    iconCount?: number;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return new Response("Name is required", { status: 400 });
    changes.name = name;
  }
  if (typeof body.data === "string") {
    const meta = parseIconSetData(body.data);
    if (!meta)
      return new Response("Not a valid icon set file", { status: 400 });
    changes.data = compressIconSetData(body.data);
    Object.assign(changes, meta);
  }
  if (changes.name === undefined && changes.data === undefined) {
    return new Response("Nothing to update", { status: 400 });
  }

  const result = await getDb()
    .update(iconSet)
    .set(changes)
    .where(and(eq(iconSet.id, params.id!), eq(iconSet.userId, user.id)))
    .returning();
  if (result.length === 0) return new Response("Not found", { status: 404 });

  const [updated] = result;
  return Response.json({
    ...updated,
    data: decompressIconSetData(updated.data),
  });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const result = await getDb()
    .delete(iconSet)
    .where(and(eq(iconSet.id, params.id!), eq(iconSet.userId, user.id)))
    .returning({ id: iconSet.id });
  if (result.length === 0) return new Response("Not found", { status: 404 });

  return new Response(null, { status: 204 });
};
