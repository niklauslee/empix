import { $Font, Font } from "bdfparser";
import { stringToAsyncIterator } from "./utils";

export const availableFonts = [
  { name: "micro", url: "/bdf/micro.bdf" },
  { name: "4x6", url: "/bdf/4x6.bdf" },
  { name: "5x7", url: "/bdf/5x7.bdf" },
  { name: "5x8", url: "/bdf/5x8.bdf" },
  { name: "6x9", url: "/bdf/6x9.bdf" },
  { name: "6x10", url: "/bdf/6x10.bdf" },
  { name: "6x12", url: "/bdf/6x12.bdf" },
  { name: "6x13", url: "/bdf/6x13.bdf" },
  { name: "6x13B", url: "/bdf/6x13B.bdf" },
  { name: "6x13O", url: "/bdf/6x13O.bdf" },
  { name: "ProFont10", url: "/bdf/profont10.bdf" },
  { name: "ProFont11", url: "/bdf/profont11.bdf" },
  { name: "ProFont12", url: "/bdf/profont12.bdf" },
  { name: "ProFont15", url: "/bdf/profont15.bdf" },
  { name: "ProFont17", url: "/bdf/profont17.bdf" },
  { name: "ProFont22", url: "/bdf/profont22.bdf" },
  { name: "ProFont29", url: "/bdf/profont29.bdf" },
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

/**
 * Loading all available fonts into the font registry
 */
export async function loadAllFonts() {
  await Promise.all(availableFonts.map((font) => loadFontFromUrl(font.url)));
}
