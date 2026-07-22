import { nanoid } from "nanoid";
import { GraphicContext } from "./graphics";
import * as geometry from "./geometry";
import { Color } from "./consts";
import { drawBox, drawPath } from "./utils";
import { TypedEvent } from "./std";

/**
 * Shape types
 */
export const ShapeType = {
  RECTANGLE: "Rectangle",
  ELLIPSE: "Ellipse",
  LINE: "Line",
  TEXT: "Text",
  PEN: "Pen",
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
  closed: boolean;
}

/**
 * Text shape type
 */
export interface TextShape extends Shape {
  type: typeof ShapeType.TEXT;
  font: string;
  text: string;
  direction: number; // 0: 0°, 1: 90°, 2: 180°, 3: 270°
}

/**
 * Pen shape type
 */
export interface PenShape extends Shape {
  type: typeof ShapeType.PEN;
  points: number[][];
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
 * Shape properties type
 */
export type ShapeProps = Partial<
  Omit<RectangleShape, "type"> &
    Omit<EllipseShape, "type"> &
    Omit<LineShape, "type"> &
    Omit<TextShape, "type"> &
    Omit<PenShape, "type"> &
    Omit<BitmapShape, "type">
> & { type?: string };

/**
 * ShapeFactory is responsible for creating shapes based on their type.
 */
export class ShapeFactory {
  onCreate: TypedEvent<Shape>;

  constructor() {
    this.onCreate = new TypedEvent<Shape>();
  }

  create(shapeType: string): Shape {
    let newShape: Shape = {
      id: nanoid(),
      type: ShapeType.RECTANGLE,
      name: "",
      left: 0,
      top: 0,
      width: 2,
      height: 2,
      color: 1,
    };
    switch (shapeType) {
      case ShapeType.RECTANGLE: {
        const s = newShape as RectangleShape;
        s.type = ShapeType.RECTANGLE;
        s.fill = false;
        s.width = 2;
        s.height = 2;
        break;
      }
      case ShapeType.ELLIPSE: {
        const s = newShape as EllipseShape;
        s.type = ShapeType.ELLIPSE;
        s.fill = false;
        s.width = 3;
        s.height = 3;
        break;
      }
      case ShapeType.LINE: {
        const s = newShape as LineShape;
        s.type = ShapeType.LINE;
        s.path = [
          [0, 0],
          [1, 1],
        ];
        s.closed = false;
        break;
      }
      case ShapeType.TEXT: {
        const s = newShape as TextShape;
        s.type = ShapeType.TEXT;
        s.font = "6x10";
        s.text = "Text";
        s.direction = 0;
        break;
      }
      case ShapeType.PEN: {
        const s = newShape as PenShape;
        s.type = ShapeType.PEN;
        s.points = [];
        break;
      }
      case ShapeType.BITMAP: {
        const s = newShape as BitmapShape;
        s.type = ShapeType.BITMAP;
        s.width = 8;
        s.height = 8;
        s.bpp = 1;
        s.data = new Uint8Array([
          0b00111100, 0b01000010, 0b10000001, 0b10100101, 0b10000001,
          0b10011001, 0b01000010, 0b00111100,
        ]);
        break;
      }
      default:
        throw new Error(`Unknown shape type: ${shapeType}`);
    }
    this.onCreate.emit(newShape);
    return newShape;
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
    case ShapeType.PEN:
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
      if (s.path.length > 2 && s.closed) {
        return geometry.copyPath([...s.path, geometry.copy(s.path[0])]);
      }
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
    case ShapeType.PEN:
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
 * Move a shape by a given delta in x and y directions
 */
export function move(shape: Shape, dx: number, dy: number): void {
  if (dx === 0 && dy === 0) return;
  shape.left += dx;
  shape.top += dy;
  switch (shape.type) {
    case ShapeType.LINE: {
      const line = shape as LineShape;
      line.path = geometry.movePath(line.path, dx, dy);
      break;
    }
    case ShapeType.PEN: {
      const pen = shape as PenShape;
      pen.points = geometry.movePath(pen.points, dx, dy);
      break;
    }
  }
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
      if (s.path.length > 2 && s.closed) {
        const [x1, y1] = s.path[s.path.length - 1];
        const [x2, y2] = s.path[0];
        gc.drawLine(x1, y1, x2, y2, s.color);
      }
      break;
    }
    case ShapeType.TEXT: {
      const s = shape as TextShape;
      gc.setFont(s.font);
      const m = gc.metricText(s.text);
      const left = s.left;
      const top = s.top;
      const right = s.left + s.width - 1;
      const bottom = s.top + s.height - 1;
      const baseline = m.baseline;
      switch (s.direction) {
        case 1:
          gc.drawText(right - baseline, top, s.text, s.color, 1);
          break;
        case 2:
          gc.drawText(right, bottom - baseline, s.text, s.color, 2);
          break;
        case 3:
          gc.drawText(left + baseline, bottom, s.text, s.color, 3);
          break;
        default:
          gc.drawText(left, top + baseline, s.text, s.color);
      }
      break;
    }
    case ShapeType.PEN: {
      const s = shape as PenShape;
      gc.drawPoints(s.points, s.color);
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
    case ShapeType.PEN:
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
