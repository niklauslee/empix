/** Parsed shape of `Editor#saveToJSON()`, without pulling in the editor core. */
export interface SceneMeta {
  width: number;
  height: number;
  shapeCount: number;
}

/** Validates and extracts metadata from a scene JSON string in one pass. */
export function parseSceneData(data: string): SceneMeta | null {
  let json: unknown;
  try {
    json = JSON.parse(data);
  } catch {
    return null;
  }
  if (typeof json !== "object" || json === null) return null;
  const { width, height, shapes } = json as Record<string, unknown>;
  if (typeof width !== "number" || typeof height !== "number") return null;
  if (!Array.isArray(shapes)) return null;
  return { width, height, shapeCount: shapes.length };
}
