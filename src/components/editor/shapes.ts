import { nanoid } from "nanoid";
import { GraphicContext } from "./graphics";
import * as geometry from "./geometry";

/**
 * Shape types
 */
export const ShapeType = {
  RECTANGLE: "Rectangle",
  ELLIPSE: "Ellipse",
  LINE: "Line",
  TEXT: "Text",
  BITMAP: "Bitmap",
} as const;

/**
 * Shape type
 */
export interface Shape {
  id: string;
  type: string;
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: number;
}

/**
 * Rectangle shape type
 */
export interface RectangleShape extends Shape {
  type: typeof ShapeType.RECTANGLE;
}

/**
 * Ellipse shape type
 */
export interface EllipseShape extends Shape {
  type: typeof ShapeType.ELLIPSE;
}

/**
 * Line shape type
 */
export interface LineShape extends Shape {
  type: typeof ShapeType.LINE;
  path: number[][];
}

/**
 * Text shape type
 */
export interface TextShape extends Shape {
  type: typeof ShapeType.TEXT;
  text: string;
  font: string;
}

/**
 * Bitmap shape type
 */
export interface BitmapShape extends Shape {
  type: typeof ShapeType.BITMAP;
  bpp: number;
  data: Uint8Array;
}

/**
 * ShapeFactory is responsible for creating shapes based on their type.
 */
export class ShapeFactory {
  create(shapeType: string): Shape {
    const defaults = {
      id: nanoid(),
      name: "",
      left: 0,
      top: 0,
      width: 1,
      height: 1,
      color: 1,
    };
    switch (shapeType) {
      case ShapeType.RECTANGLE:
        return {
          ...defaults,
          type: ShapeType.RECTANGLE,
        } as RectangleShape;
      case ShapeType.ELLIPSE:
        return {
          ...defaults,
          type: ShapeType.ELLIPSE,
        } as EllipseShape;
      case ShapeType.LINE:
        return {
          ...defaults,
          type: ShapeType.LINE,
          path: [
            [0, 0],
            [1, 1],
          ],
        } as LineShape;
      case ShapeType.TEXT:
        return {
          ...defaults,
          type: ShapeType.TEXT,
          font: "-Misc-Fixed-Medium-R-Normal--6-60-75-75-C-40-ISO10646-1", // "Leros",
          text: "Hello, world!Ä",
        } as TextShape;
      case ShapeType.BITMAP:
        return {
          ...defaults,
          type: ShapeType.BITMAP,
          width: 8,
          height: 8,
          bpp: 1,
          data: new Uint8Array([
            0b00111100, 0b01000010, 0b10000001, 0b10100101, 0b10000001,
            0b10011001, 0b01000010, 0b00111100,
          ]),
        } as BitmapShape;
      default:
        throw new Error(`Unknown shape type: ${shapeType}`);
    }
  }
}

/**
 * Get the bounding rectangle of a shape
 */
export function getBoundingRect(shape: Shape): number[][] {
  return geometry.normalizeRect([
    [shape.left, shape.top],
    [shape.left + shape.width - 1, shape.top + shape.height - 1],
  ]);
}

/**
 * Check if a point is contained within a shape
 */
export function containsPoint(shape: Shape, point: number[]): boolean {
  const r = getBoundingRect(shape);
  return geometry.inRect(point, r);
}

/**
 * Draw the shape on the graphic context
 */
export function render(gc: GraphicContext, shape: Shape) {
  switch (shape.type) {
    case ShapeType.RECTANGLE: {
      const s = shape as RectangleShape;
      gc.drawRect(s.left, s.top, s.width, s.height, s.color);
      break;
    }
    case ShapeType.ELLIPSE: {
      const s = shape as EllipseShape;
      gc.drawEllipse(
        s.left,
        s.top,
        s.left + s.width - 1,
        s.top + s.height - 1,
        s.color,
      );
      break;
    }
    case ShapeType.LINE: {
      const s = shape as LineShape;
      if (s.path.length < 2) {
        throw new Error(
          "Line shape must have at least two points in its path.",
        );
      }
      for (let i = 0; i < s.path.length - 1; i++) {
        const [x1, y1] = s.path[i];
        const [x2, y2] = s.path[i + 1];
        gc.drawLine(x1, y1, x2, y2, s.color);
      }
      break;
    }
    case ShapeType.TEXT: {
      const s = shape as TextShape;
      gc.setFont(s.font);
      gc.drawText(s.left, s.top, s.text, s.color);
      break;
    }
    case ShapeType.BITMAP: {
      const s = shape as BitmapShape;
      gc.drawBitmap(s.left, s.top, s.width, s.height, s.data, s.bpp);
      break;
    }
    default:
      throw new Error(`Unknown shape type: ${shape.type}`);
  }
}
