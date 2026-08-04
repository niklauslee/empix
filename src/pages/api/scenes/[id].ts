import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { scene } from "@/lib/db/schema";
import { parseSceneData } from "@/lib/db/scenes";

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const [row] = await getDb()
    .select()
    .from(scene)
    .where(and(eq(scene.id, params.id!), eq(scene.userId, user.id)));
  if (!row) return new Response("Not found", { status: 404 });

  return Response.json(row);
};

export const PATCH: APIRoute = async ({ params, locals, request }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json()) as { name?: unknown; data?: unknown };
  const changes: {
    name?: string;
    data?: string;
    width?: number;
    height?: number;
    shapeCount?: number;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return new Response("Name is required", { status: 400 });
    changes.name = name;
  }
  if (typeof body.data === "string") {
    const meta = parseSceneData(body.data);
    if (!meta) return new Response("Not a valid scene file", { status: 400 });
    changes.data = body.data;
    Object.assign(changes, meta);
  }
  if (changes.name === undefined && changes.data === undefined) {
    return new Response("Nothing to update", { status: 400 });
  }

  const result = await getDb()
    .update(scene)
    .set(changes)
    .where(and(eq(scene.id, params.id!), eq(scene.userId, user.id)))
    .returning();
  if (result.length === 0) return new Response("Not found", { status: 404 });

  return Response.json(result[0]);
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const result = await getDb()
    .delete(scene)
    .where(and(eq(scene.id, params.id!), eq(scene.userId, user.id)))
    .returning({ id: scene.id });
  if (result.length === 0) return new Response("Not found", { status: 404 });

  return new Response(null, { status: 204 });
};
