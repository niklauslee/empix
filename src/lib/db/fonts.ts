import { deflate, inflate } from "pako";

/** Glyph count from BDF source, without pulling in the font editor's parser. */
export function countGlyphs(bdf: string): number {
  const chars = bdf.match(/^CHARS\s+(\d+)/m);
  if (chars) return Number(chars[1]);
  return (bdf.match(/^STARTCHAR/gm) ?? []).length;
}

/** Compress BDF source for storage in the `font.data` blob column. */
export function compressFontData(bdf: string): Buffer {
  return Buffer.from(deflate(bdf));
}

/** Decompress the `font.data` blob column back into BDF source. */
export function decompressFontData(data: Buffer | Uint8Array): string {
  return new TextDecoder("utf-8").decode(inflate(data));
}
