import { deflate, inflate } from "pako";

/** Parsed shape of an `IconSet` JSON string, without pulling in the icon editor. */
export interface IconSetMeta {
  width: number;
  height: number;
  iconCount: number;
}

/** Validates and extracts metadata from an icon set JSON string in one pass. */
export function parseIconSetData(data: string): IconSetMeta | null {
  let json: unknown;
  try {
    json = JSON.parse(data);
  } catch {
    return null;
  }
  if (typeof json !== "object" || json === null) return null;
  const { box, icons } = json as Record<string, unknown>;
  if (typeof box !== "object" || box === null) return null;
  const { w, h } = box as Record<string, unknown>;
  if (typeof w !== "number" || typeof h !== "number") return null;
  if (!Array.isArray(icons)) return null;
  return { width: w, height: h, iconCount: icons.length };
}

/** Compress icon set JSON for storage in the `iconSet.data` blob column. */
export function compressIconSetData(data: string): Buffer {
  return Buffer.from(deflate(data));
}

/** Decompress the `iconSet.data` blob column back into icon set JSON. */
export function decompressIconSetData(data: Buffer | Uint8Array): string {
  return new TextDecoder("utf-8").decode(inflate(data));
}
