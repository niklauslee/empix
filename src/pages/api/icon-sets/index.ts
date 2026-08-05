import type { APIRoute } from "astro";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { iconSet } from "@/lib/db/schema";
import { compressIconSetData, parseIconSetData } from "@/lib/db/icon-sets";

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const rows = await getDb()
    .select({
      id: iconSet.id,
      name: iconSet.name,
      width: iconSet.width,
      height: iconSet.height,
      iconCount: iconSet.iconCount,
      createdAt: iconSet.createdAt,
      updatedAt: iconSet.updatedAt,
    })
    .from(iconSet)
    .where(eq(iconSet.userId, user.id))
    .orderBy(desc(iconSet.updatedAt));

  return Response.json(rows);
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json()) as { name?: unknown; data?: unknown };
  const data = typeof body.data === "string" ? body.data : "";
  const meta = parseIconSetData(data);
  if (!meta) return new Response("Not a valid icon set file", { status: 400 });
  const name =
    typeof body.name === "string" && body.name.trim().length > 0
      ? body.name.trim()
      : "untitled";

  const now = new Date();
  const row = {
    id: crypto.randomUUID(),
    userId: user.id,
    name,
    data: compressIconSetData(data),
    ...meta,
    createdAt: now,
    updatedAt: now,
  };
  await getDb().insert(iconSet).values(row);

  return Response.json({ ...row, data }, { status: 201 });
};
