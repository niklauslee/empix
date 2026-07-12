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
  color: string;
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
 * ShapeFactory is responsible for creating shapes based on their type.
 */
export class ShapeFactory {
  create(shapeType: string): Shape {
    switch (shapeType) {
      case ShapeType.RECTANGLE:
        return {
          id: nanoid(),
          type: ShapeType.RECTANGLE,
          name: "",
          left: 0,
          top: 0,
          width: 1,
          height: 1,
          color: "#000000",
        } as RectangleShape;
      case ShapeType.ELLIPSE:
        return {
          id: nanoid(),
          type: ShapeType.ELLIPSE,
          name: "",
          left: 0,
          top: 0,
          width: 1,
          height: 1,
          color: "#000000",
        } as EllipseShape;
      case ShapeType.LINE:
        return {
          id: nanoid(),
          type: ShapeType.LINE,
          name: "",
          left: 0,
          top: 0,
          width: 1,
          height: 1,
          color: "#000000",
          path: [
            [0, 0],
            [1, 1],
          ],
        } as LineShape;
      case ShapeType.TEXT:
        return {
          id: nanoid(),
          type: ShapeType.TEXT,
          name: "",
          left: 10,
          top: 10,
          width: 1,
          height: 1,
          color: "#000000",
          font: "-Misc-Fixed-Medium-R-Normal--6-60-75-75-C-40-ISO10646-1", // "Leros",
          text: "Hello, world!Ä",
        } as TextShape;
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
    default:
      throw new Error(`Unknown shape type: ${shape.type}`);
  }
}
