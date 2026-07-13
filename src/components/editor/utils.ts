import {
  Color,
  CONTROL_LINE_WIDTH,
  CONTROL_POINT_APOTHEM,
  ControllerPosition,
} from "./consts";
import * as geometry from "./geometry";
import { GraphicContext } from "./graphics";
import { getBoundingRect, type LineShape, type Shape } from "./shapes";

/**
 * Convert a string to an async iterator of lines
 */
export async function* stringToAsyncIterator(
  text: string,
): AsyncIterableIterator<string> {
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    yield line;
  }
}

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
  gc.context.lineWidth = CONTROL_LINE_WIDTH;
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
 * - type = 0: Rect
 * - type = 1: Circle
 * - type = 2: Rect with Plus
 * - type = 3: Cross
 * - type = 4: Circle with Plus
 */
export function drawControlPoint(
  gc: GraphicContext,
  x: number,
  y: number,
  type: number = 0,
) {
  const g = CONTROL_POINT_APOTHEM;
  gc.context.save();
  gc.context.scale(gc.ratio, gc.ratio);
  gc.context.fillStyle = Color.BACKGROUND;
  gc.context.strokeStyle = Color.SELECTION;
  gc.context.lineWidth = CONTROL_LINE_WIDTH;
  switch (type) {
    case 0: // Rect
      gc.context.fillRect(x - g, y - g, g * 2, g * 2);
      gc.context.strokeRect(x - g, y - g, g * 2, g * 2);
      break;
    case 1: // Circle
      gc.context.beginPath();
      gc.context.arc(x, y, g, 0, Math.PI * 2);
      gc.context.fill();
      gc.context.stroke();
      break;
    case 2: // Rect with Plus
      gc.context.fillRect(x - g, y - g, g * 2, g * 2);
      gc.context.strokeRect(x - g, y - g, g * 2, g * 2);
      gc.context.beginPath();
      gc.context.moveTo(x - g, y);
      gc.context.lineTo(x + g, y);
      gc.context.moveTo(x, y - g);
      gc.context.lineTo(x, y + g);
      gc.context.stroke();
      break;
    case 3: // Cross
      gc.context.beginPath();
      gc.context.moveTo(x - g, y - g);
      gc.context.lineTo(x + g, y + g);
      gc.context.moveTo(x + g, y - g);
      gc.context.lineTo(x - g, y + g);
      gc.context.stroke();
      break;
    case 4: // Circle with Plus
      gc.context.beginPath();
      gc.context.arc(x, y, g, 0, Math.PI * 2);
      gc.context.fill();
      gc.context.stroke();
      gc.context.beginPath();
      gc.context.moveTo(x - g, y);
      gc.context.lineTo(x + g, y);
      gc.context.moveTo(x, y - g);
      gc.context.lineTo(x, y + g);
      gc.context.stroke();
      break;
  }
  gc.context.restore();
}

/**
 * Returns whether a point inside the controlPoint
 */
export function inControlPoint(
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
 * Returns the index of the control point if the point is inside a control point of the line shape, otherwise returns -1
 */
export function findControlPoint(
  gc: GraphicContext,
  shape: LineShape,
  point: number[],
): number {
  let cpIndex = -1;
  for (let i = 0; i < shape.path.length; i++) {
    const cp = gc.toCanvasCoord(shape.path[i], true);
    if (inControlPoint(point, cp)) {
      cpIndex = i;
      break;
    }
  }
  return cpIndex;
}

/**
 * Get index of the segment control point where mouse in
 */
export function findSegmentControlPoint(
  gc: GraphicContext,
  shape: LineShape,
  p: number[],
): number {
  if (shape.path.length > 1) {
    for (let i = 0; i < shape.path.length - 1; i++) {
      const p1 = gc.toCanvasCoord(shape.path[i], true);
      const p2 = gc.toCanvasCoord(shape.path[i + 1], true);
      const outline = geometry
        .copyPath(shape.path)
        .map((p) => gc.toCanvasCoord(p, true));
      const p1pos = i === 0 ? 0 : geometry.getPositionOnPath(outline, p1);
      const p2pos =
        i === shape.path.length - 2
          ? 1
          : geometry.getPositionOnPath(outline, p2);
      const midpos = (p1pos + p2pos) / 2;
      const mid = geometry.getPointOnPath(outline, midpos);
      if (inControlPoint(p, mid)) return i;
    }
  }
  return -1;
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

/**
 * Reduce the path by removing points that are too close to each other.
 */
export function reducePath(
  path: number[][],
  stratifyAngleThreshold: number,
): number[][] {
  let newPath = geometry.copyPath(path);
  let i = 0;
  while (i < newPath.length - 2) {
    const p1 = newPath[i];
    const p2 = newPath[i + 1];
    const p3 = newPath[i + 2];
    const _angle = geometry.normalizeAngle(
      geometry.angle(p2, p3) - geometry.angle(p2, p1),
    );
    if (geometry.equals(p1, p2)) {
      newPath.splice(i, 1);
    } else if (Math.abs(180 - _angle) < stratifyAngleThreshold) {
      newPath.splice(i + 1, 1);
    } else {
      i++;
    }
  }
  return newPath;
}
