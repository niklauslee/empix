import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
