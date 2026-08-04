/** Glyph count from BDF source, without pulling in the font editor's parser. */
export function countGlyphs(bdf: string): number {
  const chars = bdf.match(/^CHARS\s+(\d+)/m);
  if (chars) return Number(chars[1]);
  return (bdf.match(/^STARTCHAR/gm) ?? []).length;
}
