/**
 * Icon set model. Every icon in a set shares one fixed pixel box — unlike the
 * font editor there is no baseline/origin concept, so `Box` is just a size
 * and icons sit at row 0 / col 0.
 */

export interface Box {
  w: number;
  h: number;
}

export interface Icon {
  name: string;
  /** Row-major bitmap in the set's box frame, length = `box.w * box.h`. */
  pixels: boolean[];
}

export interface IconSet {
  box: Box;
  /** Icons, in creation/import order. */
  icons: Icon[];
}

export function pixelCount(box: Box): number {
  return box.w * box.h;
}

export function emptyPixels(box: Box): boolean[] {
  return new Array(pixelCount(box)).fill(false);
}

export function getPixel(
  box: Box,
  pixels: boolean[],
  col: number,
  row: number,
): boolean {
  if (col < 0 || col >= box.w || row < 0 || row >= box.h) return false;
  return pixels[row * box.w + col] === true;
}

export function findIcon(project: IconSet, name: string): Icon | null {
  return project.icons.find((icon) => icon.name === name) ?? null;
}

/** First available name of the form `base`, `base_1`, `base_2`, ... */
export function uniqueName(project: IconSet, base: string): string {
  if (!findIcon(project, base)) return base;
  let index = 1;
  while (findIcon(project, `${base}_${index}`)) index++;
  return `${base}_${index}`;
}

export function createIcon(box: Box, name: string): Icon {
  return { name, pixels: emptyPixels(box) };
}

export function createIconSet(box: Partial<Box> = {}): IconSet {
  return { box: { w: 16, h: 16, ...box }, icons: [] };
}

/**
 * Copy a bitmap from one box frame into another, top-left anchored. Pixels
 * falling outside the new box are dropped.
 */
export function remapPixels(from: Box, pixels: boolean[], to: Box): boolean[] {
  const result = emptyPixels(to);
  const w = Math.min(from.w, to.w);
  const h = Math.min(from.h, to.h);
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      if (getPixel(from, pixels, col, row)) result[row * to.w + col] = true;
    }
  }
  return result;
}

/** Move every icon into a new box, top-left anchored. */
export function resizeBox(project: IconSet, box: Box): IconSet {
  const from = project.box;
  if (box.w === from.w && box.h === from.h) return project;
  const icons = project.icons.map((icon) => ({
    ...icon,
    pixels: remapPixels(from, icon.pixels, box),
  }));
  return { ...project, box, icons };
}

/** Valid C identifier derived from a name, falling back to `icon` when empty. */
export function sanitizeIdentifier(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_]/g, "_");
  const prefixed = /^[0-9]/.test(cleaned) ? `_${cleaned}` : cleaned;
  return prefixed || "icon";
}

/** Pack a pixel bitmap 1 bit/pixel (LSB first) and base64-encode it for JSON. */
function packPixels(pixels: boolean[]): string {
  const bytes = new Uint8Array(Math.ceil(pixels.length / 8));
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i]) bytes[i >> 3] |= 1 << (i & 7);
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Reverse of {@link packPixels}, padded/truncated to `count` pixels. */
function unpackPixels(packed: string, count: number): boolean[] {
  const binary = atob(packed);
  const pixels = new Array<boolean>(count).fill(false);
  for (let i = 0; i < count; i++) {
    const byte = binary.charCodeAt(i >> 3);
    if (byte !== byte) break; // NaN once past the end of `binary`
    pixels[i] = (byte & (1 << (i & 7))) !== 0;
  }
  return pixels;
}

interface SerializedIcon {
  name: string;
  /** `packPixels` output — kept as a compact base64 string instead of a JSON boolean array. */
  pixels: string;
}

export function serializeIconSet(project: IconSet): string {
  const icons: SerializedIcon[] = project.icons.map((icon) => ({
    name: icon.name,
    pixels: packPixels(icon.pixels),
  }));
  return JSON.stringify({ box: project.box, icons });
}

/** Parse and validate icon set JSON. Throws on invalid input. */
export function parseIconSet(json: string): IconSet {
  const parsed = JSON.parse(json);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Not a valid icon set file");
  }
  const { box, icons } = parsed as Record<string, unknown>;
  if (
    typeof box !== "object" ||
    box === null ||
    typeof (box as Box).w !== "number" ||
    typeof (box as Box).h !== "number"
  ) {
    throw new Error("Not a valid icon set file");
  }
  if (!Array.isArray(icons)) throw new Error("Not a valid icon set file");
  const validBox = { w: Math.max(1, (box as Box).w), h: Math.max(1, (box as Box).h) };
  const count = pixelCount(validBox);
  const validIcons: Icon[] = icons.map((item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as SerializedIcon).name !== "string" ||
      typeof (item as SerializedIcon).pixels !== "string"
    ) {
      throw new Error("Not a valid icon set file");
    }
    return {
      name: (item as SerializedIcon).name,
      pixels: unpackPixels((item as SerializedIcon).pixels, count),
    };
  });
  return { box: validBox, icons: validIcons };
}
