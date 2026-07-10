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
  x1: number;
  y1: number;
  x2: number;
  y2: number;
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
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
        } as LineShape;
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
      gc.drawLine(s.x1, s.y1, s.x2, s.y2, s.color);
      break;
    }
    default:
      throw new Error(`Unknown shape type: ${shape.type}`);
  }
}
