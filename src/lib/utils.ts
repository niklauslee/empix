import type { Shape } from "@/components/editor/shapes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detects the platform the application is running on.
 */
export function detectPlatform(): string {
  const p = navigator.platform.toLowerCase();
  if (p.indexOf("mac") > -1) {
    return "darwin";
  } else if (p.indexOf("win") > -1) {
    return "win32";
  } else if (p.indexOf("linux") > -1) {
    return "linux";
  }
  return "unknown";
}

/**
 * Generates a new unique name for a shape based on its type and existing shapes.
 */
export function generateNewName(
  baseName: string,
  existingNames: string[],
): string {
  let index = 1;
  let newName = `${baseName}${index}`;
  const existingNamesSet = new Set(existingNames);
  while (existingNamesSet.has(newName)) {
    index++;
    newName = `${baseName}${index}`;
  }
  return newName;
}
