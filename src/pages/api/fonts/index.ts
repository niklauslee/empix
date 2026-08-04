import type { APIRoute } from "astro";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { font } from "@/lib/db/schema";
import { compressFontData, countGlyphs } from "@/lib/db/fonts";

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const rows = await getDb()
    .select({
      id: font.id,
      name: font.name,
      glyphCount: font.glyphCount,
      createdAt: font.createdAt,
      updatedAt: font.updatedAt,
    })
    .from(font)
    .where(eq(font.userId, user.id))
    .orderBy(desc(font.updatedAt));

  return Response.json(rows);
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json()) as { name?: unknown; data?: unknown };
  const data = typeof body.data === "string" ? body.data : "";
  if (!data.includes("STARTFONT")) {
    return new Response("Not a valid BDF file", { status: 400 });
  }
  const name =
    typeof body.name === "string" && body.name.trim().length > 0
      ? body.name.trim()
      : "untitled";

  const now = new Date();
  const row = {
    id: crypto.randomUUID(),
    userId: user.id,
    name,
    data: compressFontData(data),
    glyphCount: countGlyphs(data),
    createdAt: now,
    updatedAt: now,
  };
  await getDb().insert(font).values(row);

  return Response.json({ ...row, data }, { status: 201 });
};
