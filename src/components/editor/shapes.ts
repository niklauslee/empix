import { nanoid } from "nanoid";
import { GraphicContext } from "./graphics";
import * as geometry from "./geometry";

/**
 * Shape types
 */
export const ShapeType = {
  RECTANGLE: "Rectangle",
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
          visible: true,
          enable: true,
          left: 0,
          top: 0,
          width: 1,
          height: 1,
          color: "#000000",
        } as RectangleShape;
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
    case ShapeType.RECTANGLE:
      gc.drawRect(
        shape.left,
        shape.top,
        shape.width,
        shape.height,
        shape.color,
      );
      break;
    default:
      throw new Error(`Unknown shape type: ${shape.type}`);
  }
}
