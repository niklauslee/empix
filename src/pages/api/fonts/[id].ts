import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { font } from "@/lib/db/schema";
import {
  compressFontData,
  countGlyphs,
  decompressFontData,
} from "@/lib/db/fonts";

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const [row] = await getDb()
    .select()
    .from(font)
    .where(and(eq(font.id, params.id!), eq(font.userId, user.id)));
  if (!row) return new Response("Not found", { status: 404 });

  return Response.json({ ...row, data: decompressFontData(row.data) });
};

export const PATCH: APIRoute = async ({ params, locals, request }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json()) as { name?: unknown; data?: unknown };
  const changes: {
    name?: string;
    data?: Buffer;
    glyphCount?: number;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return new Response("Name is required", { status: 400 });
    changes.name = name;
  }
  if (typeof body.data === "string") {
    if (!body.data.includes("STARTFONT")) {
      return new Response("Not a valid BDF file", { status: 400 });
    }
    changes.data = compressFontData(body.data);
    changes.glyphCount = countGlyphs(body.data);
  }
  if (changes.name === undefined && changes.data === undefined) {
    return new Response("Nothing to update", { status: 400 });
  }

  const result = await getDb()
    .update(font)
    .set(changes)
    .where(and(eq(font.id, params.id!), eq(font.userId, user.id)))
    .returning();
  if (result.length === 0) return new Response("Not found", { status: 404 });

  const [updated] = result;
  return Response.json({ ...updated, data: decompressFontData(updated.data) });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return new Response("Unauthorized", { status: 401 });

  const result = await getDb()
    .delete(font)
    .where(and(eq(font.id, params.id!), eq(font.userId, user.id)))
    .returning({ id: font.id });
  if (result.length === 0) return new Response("Not found", { status: 404 });

  return new Response(null, { status: 204 });
};
