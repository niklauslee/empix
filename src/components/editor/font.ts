import { $Font, Font } from "bdfparser";
import { stringToAsyncIterator } from "./utils";

export const availableFonts = [
  { name: "4x6", url: "/bdf/4x6.bdf" },
  { name: "5x7", url: "/bdf/5x7.bdf" },
  { name: "5x8", url: "/bdf/5x8.bdf" },
  { name: "6x9", url: "/bdf/6x9.bdf" },
  { name: "6x10", url: "/bdf/6x10.bdf" },
  { name: "6x12", url: "/bdf/6x12.bdf" },
  { name: "6x13", url: "/bdf/6x13.bdf" },
  { name: "6x13B", url: "/bdf/6x13B.bdf" },
  { name: "6x13O", url: "/bdf/6x13O.bdf" },
  { name: "micro", url: "/bdf/micro.bdf" },
];

/**
 * Font registry
 */
const fonts: Record<string, Font> = {};

/**
 * Find a font by name
 */
export function getFont(name: string): Font | null {
  return fonts[name] ?? null;
}

/**
 * Load a font into the font registry
 */
export async function loadFont(bdfstring: string) {
  const font = await $Font(stringToAsyncIterator(bdfstring));
  fonts[font.headers?.fontname ?? "Unknown"] = font;
}

/**
 * Load a font into the font registry
 */
export async function loadFontFromUrl(url: string) {
  const response = await fetch(url);
  const bdfstring = await response.text();
  await loadFont(bdfstring);
}

/**
 * Get a list of available font names
 */
export function getFonts(): string[] {
  return Object.keys(fonts);
}

/**
 * Loading all available fonts into the font registry
 */
async function loadAllFonts() {
  await Promise.all(availableFonts.map((font) => loadFontFromUrl(font.url)));
}

await loadAllFonts();
