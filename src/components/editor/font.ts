import { $Font, Font } from "bdfparser";
import { stringToAsyncIterator } from "./utils";

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
 * Check if a font is loaded
 */
export function isFontLoaded(name: string): boolean {
  return name in fonts;
}

/**
 * Load a font into the font registry
 */
export async function loadFontFromBDF(bdfstring: string) {
  const font = await $Font(stringToAsyncIterator(bdfstring));
  fonts[font.headers?.fontname ?? "Unknown"] = font;
}

/**
 * Load a font into the font registry
 */
export async function loadFontFromUrl(url: string) {
  const response = await fetch(url);
  const bdfstring = await response.text();
  await loadFontFromBDF(bdfstring);
}

/**
 * Get a list of loaded font names
 */
export function getLoadedFonts(): string[] {
  return Object.keys(fonts);
}
