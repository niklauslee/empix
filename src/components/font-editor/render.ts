/**
 * Canvas rendering for glyphs and text, shared by the glyph browser, the
 * editing grid and the preview.
 */

import { findGlyph, type Font, type Glyph } from "./bdf";

/** Prepare a canvas for crisp pixel drawing at the device pixel ratio. */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D | null {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

/**
 * Draw a glyph with its origin (left edge, baseline) at `x`, `y`, scaled by
 * `scale` screen pixels per font pixel.
 */
export function drawGlyph(
  ctx: CanvasRenderingContext2D,
  font: Font,
  glyph: Glyph,
  x: number,
  y: number,
  scale: number,
) {
  const { box } = font;
  for (let row = 0; row < box.h; row++) {
    for (let col = 0; col < box.w; col++) {
      if (!glyph.pixels[row * box.w + col]) continue;
      ctx.fillRect(
        x + (box.ox + col) * scale,
        y - (box.oy + box.h - row) * scale,
        scale,
        scale,
      );
    }
  }
}

/** Total advance width of `text` in font pixels. */
export function measureText(font: Font, text: string): number {
  let width = 0;
  for (const char of text) {
    const glyph = findGlyph(font, char.codePointAt(0)!);
    width += glyph ? glyph.dwidth : font.box.w;
  }
  return width;
}

/** Draw a string with its origin (left edge, baseline) at `x`, `y`. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  font: Font,
  text: string,
  x: number,
  y: number,
  scale: number,
) {
  let pen = x;
  for (const char of text) {
    const glyph = findGlyph(font, char.codePointAt(0)!);
    if (glyph) {
      drawGlyph(ctx, font, glyph, pen, y, scale);
      pen += glyph.dwidth * scale;
    } else {
      pen += font.box.w * scale;
    }
  }
}
