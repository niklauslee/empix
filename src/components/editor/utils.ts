import { Color, CONTROL_POINT_APOTHEM, ControllerPosition } from "./consts";
import * as geometry from "./geometry";
import { GraphicContext } from "./graphics";
import { getBoundingRect, type Shape } from "./shapes";

/**
 * Returns the bounding rectangle of the shape in canvas coordinates
 */
export function getBoundingRectInCanvasCoord(gc: GraphicContext, shape: Shape) {
  const r = getBoundingRect(shape);
  const p1 = gc.toCanvasCoord(r[0]);
  const p2 = gc.toCanvasCoord([r[1][0] + 1, r[1][1] + 1]);
  return [
    [p1[0], p1[1]],
    [p2[0], p2[1]],
  ];
}

/**
 * Draw a boundary rectangle in pixel coordinates
 */
export function drawBoundary(
  gc: GraphicContext,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  const r = geometry.normalizeRect([
    [x1, y1],
    [x2, y2],
  ]);
  gc.context.save();
  gc.context.scale(gc.ratio, gc.ratio);
  gc.context.strokeStyle = color;
  gc.context.lineWidth = 1.5;
  gc.context.strokeRect(
    gc.margin + r[0][0] * gc.scale,
    gc.margin + r[0][1] * gc.scale,
    (r[1][0] - r[0][0] + 1) * gc.scale,
    (r[1][1] - r[0][1] + 1) * gc.scale,
  );
  gc.context.restore();
}

/**
 * Draw a control point at the given canvas coordinates
 */
export function drawControlPoint(gc: GraphicContext, x: number, y: number) {
  const g = CONTROL_POINT_APOTHEM;
  gc.context.save();
  gc.context.scale(gc.ratio, gc.ratio);
  gc.context.fillStyle = Color.BACKGROUND;
  gc.context.strokeStyle = Color.SELECTION;
  gc.context.lineWidth = 1.5;
  gc.context.fillRect(x - g, y - g, g * 2, g * 2);
  gc.context.strokeRect(x - g, y - g, g * 2, g * 2);
  gc.context.restore();
}

/**
 * Returns whether a point inside the controlPoint
 */
export function inControlPoint(
  gc: GraphicContext,
  point: number[],
  controlPoint: number[],
): boolean {
  const r = CONTROL_POINT_APOTHEM + 4;
  const cp = [
    [controlPoint[0] - r, controlPoint[1] - r],
    [controlPoint[0] + r, controlPoint[1] + r],
  ];
  return geometry.inRect(point, cp);
}

/**
 * Returns the point of the position of the controller
 */
export function getControllerPosition(
  gc: GraphicContext,
  shape: Shape,
  position: string,
): number[] {
  const delta = 0; // CONTROL_POINT_APOTHEM * 2;
  const r = getBoundingRectInCanvasCoord(gc, shape);
  switch (position) {
    case ControllerPosition.TOP: {
      const cp = geometry.mid([r[0][0], r[0][1]], [r[1][0], r[0][1]]);
      return [cp[0], cp[1] - delta];
    }
    case ControllerPosition.RIGHT: {
      const cp = geometry.mid([r[1][0], r[0][1]], [r[1][0], r[1][1]]);
      return [cp[0] + delta, cp[1]];
    }
    case ControllerPosition.BOTTOM: {
      const cp = geometry.mid([r[0][0], r[1][1]], [r[1][0], r[1][1]]);
      return [cp[0], cp[1] + delta];
    }
    case ControllerPosition.LEFT: {
      const cp = geometry.mid([r[0][0], r[0][1]], [r[0][0], r[1][1]]);
      return [cp[0] - delta, cp[1]];
    }
    case ControllerPosition.LEFT_TOP: {
      return [r[0][0] - delta, r[0][1] - delta];
    }
    case ControllerPosition.RIGHT_TOP: {
      return [r[1][0] + delta, r[0][1] - delta];
    }
    case ControllerPosition.RIGHT_BOTTOM: {
      return [r[1][0] + delta, r[1][1] + delta];
    }
    case ControllerPosition.LEFT_BOTTOM: {
      return [r[0][0] - delta, r[1][1] + delta];
    }
  }
  return [-1, -1];
}
