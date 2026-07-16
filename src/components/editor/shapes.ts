import { nanoid } from "nanoid";
import { GraphicContext } from "./graphics";
import * as geometry from "./geometry";
import { Color, CONTROL_POINT_APOTHEM } from "./consts";
import { drawBox, drawPath } from "./utils";

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
  fill: boolean;
}

/**
 * Ellipse shape type
 */
export interface EllipseShape extends Shape {
  type: typeof ShapeType.ELLIPSE;
  fill: boolean;
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
          fill: false,
        } as RectangleShape;
      case ShapeType.ELLIPSE:
        return {
          ...defaults,
          type: ShapeType.ELLIPSE,
          fill: false,
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
          font: "Leros",
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
 * Get the outline of a shape as a polygon (array of points)
 */
export function getOutline(shape: Shape): number[][] {
  switch (shape.type) {
    case ShapeType.RECTANGLE:
    case ShapeType.TEXT:
    case ShapeType.BITMAP: {
      return geometry.rectToPolygon(getBoundingRect(shape), true);
    }
    case ShapeType.ELLIPSE: {
      const s = shape as EllipseShape;
      const r = getBoundingRect(s);
      return geometry.pointsOnEllipse(
        geometry.center(r),
        s.width / 2,
        s.height / 2,
        Math.max(Math.round((s.width + s.height) / 5), 30), // num of points
      );
    }
    case ShapeType.LINE: {
      const s = shape as LineShape;
      return geometry.copyPath(s.path);
    }
    default:
      return [];
  }
}

/**
 * Check if a point is contained within a shape
 */
export function containsPoint(shape: Shape, point: number[]): boolean {
  const distance = 1.5; // pixels
  switch (shape.type) {
    case ShapeType.RECTANGLE: {
      const s = shape as RectangleShape;
      const r = getBoundingRect(s);
      if (s.fill) {
        return geometry.inRect(point, r);
      } else {
        const outline = geometry.rectToPolygon(r, true);
        return geometry.getNearSegment(point, outline, distance) >= 0;
      }
    }
    case ShapeType.ELLIPSE: {
      const s = shape as EllipseShape;
      const o = getOutline(s);
      if (s.fill) {
        return geometry.inPolygon(point, o);
      } else {
        const outline = getOutline(s);
        return geometry.getNearSegment(point, outline, distance) >= 0;
      }
    }
    case ShapeType.LINE: {
      const s = shape as LineShape;
      const o = getOutline(s);
      return geometry.getNearSegment(point, o, distance) >= 0;
    }
    case ShapeType.TEXT:
    case ShapeType.BITMAP: {
      const r = getBoundingRect(shape);
      return geometry.inRect(point, r);
    }
    default:
      return false;
  }
}

/**
 * Check if a shape's outline overlaps with a given rectangle
 */
export function overlapRect(shape: Shape, rect: number[][]): boolean {
  const outline = getOutline(shape);
  for (let i = 0; i < outline.length - 1; i++) {
    if (geometry.lineOverlapRect([outline[i], outline[i + 1]], rect))
      return true;
  }
  return false;
}

/**
 * Draw the shape on the graphic context
 */
export function render(gc: GraphicContext, shape: Shape) {
  switch (shape.type) {
    case ShapeType.RECTANGLE: {
      const s = shape as RectangleShape;
      if (s.fill) {
        gc.fillRect(s.left, s.top, s.width, s.height, s.color);
      } else {
        gc.drawRect(s.left, s.top, s.width, s.height, s.color);
      }
      break;
    }
    case ShapeType.ELLIPSE: {
      const s = shape as EllipseShape;
      if (s.fill) {
        gc.fillEllipse(
          s.left,
          s.top,
          s.left + s.width - 1,
          s.top + s.height - 1,
          s.color,
        );
      } else {
        gc.drawEllipse(
          s.left,
          s.top,
          s.left + s.width - 1,
          s.top + s.height - 1,
          s.color,
        );
      }
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

/**
 * Draw the shape's outline on the graphic context
 */
export function renderOutline(gc: GraphicContext, shape: Shape) {
  const o = getOutline(shape);

  switch (shape.type) {
    case ShapeType.RECTANGLE:
    case ShapeType.TEXT:
    case ShapeType.BITMAP: {
      const r = getBoundingRect(shape);
      drawBox(gc, r, Color.HOVER);
      break;
    }
    case ShapeType.ELLIPSE:
    case ShapeType.LINE: {
      const o = getOutline(shape);
      drawPath(gc, o, Color.HOVER);
      break;
    }
  }
}
