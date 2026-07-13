import { getFont } from "./font";

/**
 * Graphic context options
 */
export interface GraphicContextOptions {
  width: number;
  height: number;
  bpp: number;
  margin: number;
  scale: number;
}

/**
 * Graphic context object
 */
export class GraphicContext {
  /**
   * The canvas element
   */
  canvas: HTMLCanvasElement;

  /**
   * The 2D rendering context
   */
  context: CanvasRenderingContext2D;

  /**
   * The pixel buffer
   */
  buffer: Uint8Array;

  /**
   * The device pixel ratio
   */
  ratio: number = window.devicePixelRatio ?? 1;

  /**
   * The margin around the canvas in pixels
   */
  margin: number;

  /**
   * The width of the canvas in pixels
   */
  width: number;

  /**
   * The height of the canvas in pixels
   */
  height: number;

  /**
   * The bits per pixel
   */
  bpp: number;

  /**
   * The scale of the canvas
   */
  scale: number;

  /**
   * The font used for text rendering
   */
  font: string | null;

  constructor(canvas: HTMLCanvasElement, options: GraphicContextOptions) {
    this.canvas = canvas;
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Failed to create context2d");
    this.context = context;
    this.width = options.width;
    this.height = options.height;
    this.bpp = options.bpp;
    this.buffer = new Uint8Array(
      Math.ceil((this.width * this.bpp) / 8) * this.height,
    ).fill(0);
    this.scale = options.scale;
    this.margin = options.margin;
    this.font = "Leros";
  }

  /**
   * Convert canvas coordinates to pixel coordinates
   */
  toPixelCoord(point: number[]): [number, number] {
    const px = Math.floor((point[0] - this.margin) / this.scale);
    const py = Math.floor((point[1] - this.margin) / this.scale);
    return [px, py];
  }

  /**
   * Convert pixel coordinates to canvas coordinates
   */
  toCanvasCoord(
    point: number[],
    pixelCenter: boolean = false,
  ): [number, number] {
    let cx = this.margin + point[0] * this.scale;
    let cy = this.margin + point[1] * this.scale;
    if (pixelCenter) {
      cx += 0.5 * this.scale;
      cy += 0.5 * this.scale;
    }
    return [cx, cy];
  }

  /**
   * Convert a color value to a CSS color string
   */
  toCssColor(color: number): string {
    if (this.bpp === 1) {
      return color === 0 ? "#000000" : "#FFFFFF";
    }
    return "#FFFFFF";
  }

  /**
   * Clear the buffer
   */
  clear() {
    this.buffer.fill(0);
    // this.context.save();
    // this.context.scale(this.ratio, this.ratio);
    this.context.fillStyle = this.toCssColor(0);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // this.context.restore();
  }

  /**
   * Get the size of the canvas in pixels
   */
  getSize(): number[] {
    return [this.width, this.height];
  }

  /**
   * Set the size of the canvas in pixels
   */
  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.buffer = new Uint8Array(
      Math.ceil((width * this.bpp) / 8) * height,
    ).fill(0);
  }

  /**
   * Set the font for text rendering
   */
  setFont(font: string) {
    this.font = font;
  }

  /**
   * Get the current font
   */
  getFont(): string | null {
    return this.font;
  }

  /**
   * Put a pixel on the buffer
   */
  putPixel(x: number, y: number, color: number) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.buffer[
      y * Math.ceil((this.width * this.bpp) / 8) +
        Math.floor((x * this.bpp) / 8)
    ] |=
      (color & ((1 << this.bpp) - 1)) << (8 - this.bpp - ((x * this.bpp) % 8));
  }

  /**
   * Get a pixel from the buffer
   */
  getPixel(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 0;
    }
    return (
      (this.buffer[
        y * Math.ceil((this.width * this.bpp) / 8) +
          Math.floor((x * this.bpp) / 8)
      ] >>
        (8 - this.bpp - ((x * this.bpp) % 8))) &
      ((1 << this.bpp) - 1)
    );
  }

  /**
   * Render the buffer to the canvas
   */
  renderBuffer() {
    this.context.save();
    this.context.scale(this.ratio, this.ratio);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const color = this.getPixel(x, y);
        if (color === 0) continue;
        this.context.fillStyle = this.toCssColor(color);
        this.context.fillRect(
          this.margin + x * this.scale,
          this.margin + y * this.scale,
          this.scale,
          this.scale,
        );
      }
    }
    this.context.restore();
  }

  /**
   * Draw a vertical line
   */
  drawVLine(x: number, y1: number, y2: number, color: number) {
    for (let y = y1; y <= y2; y++) {
      this.putPixel(x, y, color);
    }
  }

  /**
   * Draw a horizontal line
   */
  drawHLine(y: number, x1: number, x2: number, color: number) {
    for (let x = x1; x <= x2; x++) {
      this.putPixel(x, y, color);
    }
  }

  /**
   * Draw a rectangle
   */
  drawRect(x: number, y: number, width: number, height: number, color: number) {
    this.drawHLine(y, x, x + width - 1, color);
    this.drawHLine(y + height - 1, x, x + width - 1, color);
    this.drawVLine(x, y, y + height - 1, color);
    this.drawVLine(x + width - 1, y, y + height - 1, color);
  }

  /**
   * Draw an ellipse
   */
  drawEllipse(x1: number, y1: number, x2: number, y2: number, color: number) {
    const rx = Math.round(Math.abs(x2 - x1) / 2);
    const ry = Math.round(Math.abs(y2 - y1) / 2);
    const cx = Math.round((x1 + x2) / 2);
    const cy = Math.round((y1 + y2) / 2);
    const rx2 = rx * rx;
    const ry2 = ry * ry;
    let x = 0;
    let y = ry;
    let dx = 2 * ry2 * x;
    let dy = 2 * rx2 * y;
    const plot = (px: number, py: number) => {
      this.putPixel(cx + px, cy + py, color);
      this.putPixel(cx - px, cy + py, color);
      this.putPixel(cx + px, cy - py, color);
      this.putPixel(cx - px, cy - py, color);
    };
    // Region 1
    let p = ry2 - rx2 * ry + 0.25 * rx2;
    while (dx < dy) {
      plot(x, y);
      x++;
      dx += 2 * ry2;
      if (p < 0) {
        p += ry2 + dx;
      } else {
        y--;
        dy -= 2 * rx2;
        p += ry2 + dx - dy;
      }
    }
    // Region 2
    p = ry2 * (x + 0.5) * (x + 0.5) + rx2 * (y - 1) * (y - 1) - rx2 * ry2;
    while (y >= 0) {
      plot(x, y);
      y--;
      dy -= 2 * rx2;
      if (p > 0) {
        p += rx2 - dy;
      } else {
        x++;
        dx += 2 * ry2;
        p += rx2 - dy + dx;
      }
    }
  }

  /**
   * Draw a line using Bresenham's algorithm
   */
  drawLine(x1: number, y1: number, x2: number, y2: number, color: number) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    let x = x1;
    let y = y1;
    while (true) {
      this.putPixel(x, y, color);
      if (x === x2 && y === y2) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /**
   * Draw text on the canvas
   */
  drawText(x: number, y: number, text: string, color: number) {
    if (!this.font) throw new Error("Font is not set");
    const font = getFont(this.font);
    if (!font) throw new Error(`Font "${this.font}" not found`);
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const glyph = font.glyph(char);
      if (!glyph) continue;
      const { bbw, bbh, bbxoff, bbyoff, hexdata, dwx0 } = glyph.meta;
      const bitmap = hexdata.map((row) => parseInt(row, 16));
      const numBytesPerRow = Math.ceil(bbw / 8);
      for (let r = 0; r < bbh; r++) {
        const rowValue = bitmap[r] ?? 0;
        for (let b = 0; b < bbw; b++) {
          const bitPosFromRight = 8 * numBytesPerRow - 1 - b;
          const bit = (rowValue >> bitPosFromRight) & 1;
          if (bit) {
            const gx = x + bbxoff + b;
            const gy = y + r;
            this.putPixel(gx, gy, color);
          }
        }
      }
      x += dwx0 ?? bbw;
    }
  }

  /**
   * Measure the width, height, and baseline of the text in pixels
   */
  metricText(text: string): {
    width: number;
    height: number;
    baseline: number;
  } {
    if (!this.font) throw new Error("Font is not set");
    const font = getFont(this.font);
    if (!font) throw new Error(`Font "${this.font}" not found`);
    let width = 0;
    let minTop = 0;
    let maxBottom = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const glyph = font.glyph(char);
      if (!glyph) continue;
      const { bbw, bbh, bbyoff, dwx0 } = glyph.meta;
      const top = -bbyoff - bbh + 1;
      const bottom = -bbyoff;
      minTop = Math.min(minTop, top);
      maxBottom = Math.max(maxBottom, bottom);
      width += dwx0 ?? bbw;
    }
    return {
      width,
      height: maxBottom - minTop + 1,
      baseline: -minTop,
    };
  }

  /**
   * Draw bitmap on the canvas
   * @param x The x coordinate of the top-left corner of the bitmap
   * @param y The y coordinate of the top-left corner of the bitmap
   * @param width The width of the bitmap in pixels
   * @param height The height of the bitmap in pixels
   * @param bitmap The bitmap data as a Uint8Array
   * @param bpp The bits per pixel (1, 2, 4, or 8)
   */
  drawBitmap(
    x: number,
    y: number,
    width: number,
    height: number,
    bitmap: Uint8Array,
    bpp: number = 1,
  ) {
    const bytesPerRow = Math.ceil((width * bpp) / 8);
    const maxValue = (1 << bpp) - 1;
    for (let row = 0; row < height; row++) {
      const rowOffset = row * bytesPerRow;
      for (let col = 0; col < width; col++) {
        const bitStart = col * bpp;
        const byteIndex = rowOffset + Math.floor(bitStart / 8);
        const shift = 8 - bpp - (bitStart % 8);
        const pixelValue = (bitmap[byteIndex] >> shift) & maxValue;
        if (pixelValue === 0) continue;
        this.putPixel(x + col, y + row, pixelValue);
      }
    }
  }
}
