import type { APIRoute } from "astro";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { scene } from "@/lib/db/schema";
import { parseSceneData } from "@/lib/db/scenes";

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const rows = await getDb()
    .select({
      id: scene.id,
      name: scene.name,
      width: scene.width,
      height: scene.height,
      shapeCount: scene.shapeCount,
      createdAt: scene.createdAt,
      updatedAt: scene.updatedAt,
    })
    .from(scene)
    .where(eq(scene.userId, user.id))
    .orderBy(desc(scene.updatedAt));

  return Response.json(rows);
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json()) as { name?: unknown; data?: unknown };
  const data = typeof body.data === "string" ? body.data : "";
  const meta = parseSceneData(data);
  if (!meta) return new Response("Not a valid scene file", { status: 400 });
  const name =
    typeof body.name === "string" && body.name.trim().length > 0
      ? body.name.trim()
      : "untitled";

  const now = new Date();
  const row = {
    id: crypto.randomUUID(),
    userId: user.id,
    name,
    data,
    ...meta,
    createdAt: now,
    updatedAt: now,
  };
  await getDb().insert(scene).values(row);

  return Response.json(row, { status: 201 });
};
