/**
 * Copy a point
 */
export function copy(point: number[]): number[] {
  return [point[0], point[1]];
}

/**
 * Test point1 equals to point2
 */
export function equals(point1: number[], point2: number[]): boolean {
  return point1[0] === point2[0] && point1[1] === point2[1];
}

/**
 * Returns a mid point of the given two points
 */
export function mid(point1: number[], point2: number[]): number[] {
  return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
}
/**
 * Returns a point moved as dx and dy
 */
export function move(point: number[], dx: number, dy: number): number[] {
  return [point[0] + dx, point[1] + dy];
}

/**
 * Test whether a point is inside a rect
 */
export function inRect(point: number[], rect: number[][]): boolean {
  let r = normalizeRect(rect);
  return (
    r[0][0] <= point[0] &&
    point[0] <= r[1][0] &&
    r[0][1] <= point[1] &&
    point[1] <= r[1][1]
  );
}

/**
 * Distance between two points
 */
export function distance(point1: number[], point2: number[]): number {
  return Math.sqrt(
    (point1[0] - point2[0]) * (point1[0] - point2[0]) +
      (point1[1] - point2[1]) * (point1[1] - point2[1]),
  );
}

/**
 * Test whether two rects are overlap or not
 */
export function overlapRect(rect1: number[][], rect2: number[][]): boolean {
  return !(
    rect1[0][0] > rect2[1][0] ||
    rect2[0][0] > rect1[1][0] ||
    rect1[0][1] > rect2[1][1] ||
    rect2[0][1] > rect1[1][1]
  );
}

/**
 * Returns a normalized rect
 */
export function normalizeRect(rect: number[][]): number[][] {
  let x1: number, x2: number, y1: number, y2: number;
  if (rect[0][0] < rect[1][0]) {
    x1 = rect[0][0];
    x2 = rect[1][0];
  } else {
    x1 = rect[1][0];
    x2 = rect[0][0];
  }
  if (rect[0][1] < rect[1][1]) {
    y1 = rect[0][1];
    y2 = rect[1][1];
  } else {
    y1 = rect[1][1];
    y2 = rect[0][1];
  }
  return [
    [x1, y1],
    [x2, y2],
  ];
}

/**
 * Returns an union of two rects
 */
export function unionRect(rect1: number[][], rect2: number[][]): number[][] {
  return [
    [Math.min(rect1[0][0], rect2[0][0]), Math.min(rect1[0][1], rect2[0][1])],
    [Math.max(rect1[1][0], rect2[1][0]), Math.max(rect1[1][1], rect2[1][1])],
  ];
}

/**
 * Returns a normalized (0~360) angle.
 */
export function normalizeAngle(angle: number): number {
  if (angle < 0) angle = angle + 360;
  if (angle >= 360) angle = angle - 360;
  return angle;
}
