import * as geometry from "./geometry";

/**
 * Graphic context options
 */
export interface GraphicContextOptions {
  width: number;
  height: number;
  margin: number;
  scale: number;
}

/**
 * Graphic context object
 */
export class GraphicContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  ratio: number = window.devicePixelRatio ?? 1;
  margin: number;
  width: number;
  height: number;
  scale: number;

  constructor(canvas: HTMLCanvasElement, options: GraphicContextOptions) {
    this.canvas = canvas;
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Failed to create context2d");
    this.context = context;
    this.margin = options.margin;
    this.width = options.width;
    this.height = options.height;
    this.scale = options.scale;
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
  toCanvasCoord(point: number[]): [number, number] {
    const cx = this.margin + point[0] * this.scale;
    const cy = this.margin + point[1] * this.scale;
    return [cx, cy];
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw a pixel on the canvas
   */
  drawPixel(x: number, y: number, color: string) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.context.save();
    this.context.scale(this.ratio, this.ratio);
    this.context.fillStyle = color;
    this.context.fillRect(
      this.margin + x * this.scale,
      this.margin + y * this.scale,
      this.scale,
      this.scale,
    );
    this.context.restore();
  }

  /**
   * Draw a vertical line
   */
  drawVLine(x: number, y1: number, y2: number, color: string) {
    for (let y = y1; y <= y2; y++) {
      this.drawPixel(x, y, color);
    }
  }

  /**
   * Draw a horizontal line
   */
  drawHLine(y: number, x1: number, x2: number, color: string) {
    for (let x = x1; x <= x2; x++) {
      this.drawPixel(x, y, color);
    }
  }

  /**
   * Draw a rectangle
   */
  drawRect(x: number, y: number, width: number, height: number, color: string) {
    this.drawHLine(y, x, x + width - 1, color);
    this.drawHLine(y + height - 1, x, x + width - 1, color);
    this.drawVLine(x, y, y + height - 1, color);
    this.drawVLine(x + width - 1, y, y + height - 1, color);
  }

  /**
   * Draw an ellipse
   */
  drawEllipse(x1: number, y1: number, x2: number, y2: number, color: string) {
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
      this.drawPixel(cx + px, cy + py, color);
      this.drawPixel(cx - px, cy + py, color);
      this.drawPixel(cx + px, cy - py, color);
      this.drawPixel(cx - px, cy - py, color);
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
  drawLine(x1: number, y1: number, x2: number, y2: number, color: string) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    let x = x1;
    let y = y1;
    while (true) {
      this.drawPixel(x, y, color);
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
}
