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
 * Quantize point
 */
export function quantize(point: number[]): number[] {
  const x = Math.round(point[0]);
  const y = Math.round(point[1]);
  return [x, y];
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
 * Returns width of the rect
 */
export function width(rect: number[][]): number {
  return Math.abs(rect[1][0] - rect[0][0]);
}

/**
 * Returns height of the rect
 */
export function height(rect: number[][]): number {
  return Math.abs(rect[1][1] - rect[0][1]);
}

/**
 * Returns an copy of the rect
 */
export function copyRect(rect: number[][]): number[][] {
  return [copy(rect[0]), copy(rect[1])];
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
 * Squared distance between two points
 */
export function distance2(point1: number[], point2: number[]): number {
  return (
    Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
  );
}

/**
 * Shortest distance from a point to line
 */
export function distanceToLine(point: number[], line: number[][]): number {
  let sp = line[0];
  let ep = line[1];
  let l2 = distance2(sp, ep);
  if (l2 === 0) return distance2(point, sp);
  let t =
    ((point[0] - sp[0]) * (ep[0] - sp[0]) +
      (point[1] - sp[1]) * (ep[1] - sp[1])) /
    l2;
  t = Math.max(0, Math.min(1, t));
  let squared = distance2(point, [
    sp[0] + t * (ep[0] - sp[0]),
    sp[1] + t * (ep[1] - sp[1]),
  ]);
  return Math.sqrt(squared);
}

/**
 * Copy a path
 */
export function copyPath(path: number[][]): number[][] {
  return path.map((p) => copy(p));
}

/**
 * Returns path moved as dx and dy
 */
export function movePath(path: number[][], dx: number, dy: number): number[][] {
  return path.map((p) => move(p, dx, dy));
}

/**
 * Return total length of the given path
 */
export function pathLength(path: number[][]): number {
  let len = 0;
  for (let i = 1; i < path.length; i++) {
    const d = distance(path[i - 1], path[i]);
    len += d;
  }
  return len;
}

/**
 * Returns the index of segment which is closer to the point than distance
 * @param point
 * @param path
 * @param distance
 * @returns index of segment (-1 if not found)
 */
export function getNearSegment(
  point: number[],
  path: number[][],
  distance: number,
): number {
  for (let i = 0; i < path.length - 1; i++) {
    const dist = distanceToLine(point, [path[i], path[i + 1]]);
    if (dist < distance) {
      return i;
    }
  }
  return -1;
}

/**
 * Get a bounding rect of a path
 */
export function boundingRect(path: number[][]): number[][] {
  const xs = path.map((p) => p[0]);
  const ys = path.map((p) => p[1]);
  return [
    [Math.min(...xs), Math.min(...ys)],
    [Math.max(...xs), Math.max(...ys)],
  ];
}

/**
 * Return a point which is positioned on the line.
 * If position is 0, returns the start point and if position is 1, returns the end point
 * @param point1 line start point
 * @param point2 line end point
 * @param position position value (0 ~ 1) on the path
 */
export function getPointOnLine(
  point1: number[],
  point2: number[],
  position: number,
): number[] {
  if (position < 0 || position > 1)
    throw new Error("position should be a value between 0 and 1");
  const d0 = (point2[0] - point1[0]) * position;
  const d1 = (point2[1] - point1[1]) * position;
  return [point1[0] + d0, point1[1] + d1];
}

/**
 * Return a point which is positioned on the path.
 * If position is 0, returns the start point and if position is 1, returns the end point
 * @param path path
 * @param position position value (0 ~ 1) on the path
 */
export function getPointOnPath(path: number[][], position: number): number[] {
  if (position < 0 || position > 1)
    throw new Error("position should be a value between 0 and 1");
  const len = pathLength(path);
  let p = len * position;
  for (let i = 1; i < path.length; i++) {
    const l = distance(path[i - 1], path[i]);
    if (p <= l) {
      return getPointOnLine(path[i - 1], path[i], p / l);
    }
    p = p - l;
  }
  return [path[0][0], path[0][1]];
}

/**
 * Get position value of the given point on the given line.
 * It assumes that the point is on the line.
 * Returns 0 if the point is same with the start point of the line,
 * and returns 1 if the point is same with the end point of the line.
 * @param linepoint1
 * @param linepoint2
 * @param point
 */
export function getPositionOnLine(
  linepoint1: number[],
  linepoint2: number[],
  point: number[],
): number {
  let d = distance(linepoint1, linepoint2);
  if (d === 0) d = 0.00000001;
  const dp = distance(linepoint1, point);
  return dp / d;
}

/**
 * Get position value of the given point on the given path.
 * It assumes that the point is on the path.
 * Returns 0 if the point is same with the start point of the path,
 * and returns 1 if the point is same with the end point of the path.
 * @param linepoint1
 * @param linepoint2
 * @param point
 * @param dist distance value to find nearest segment
 */
export function getPositionOnPath(
  path: number[][],
  point: number[],
  dist: number = 1,
): number {
  const len = pathLength(path);
  const segment = getNearSegment(point, path, dist);
  let p = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const l = distance(path[i], path[i + 1]);
    if (i === segment) {
      p += getPositionOnLine(path[i], path[i + 1], point) * l;
      return p / len;
    }
    p += l;
  }
  return 0;
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
 * Get the angle in degree between two points
 */
export function angle(center: number[], point: number[]): number {
  var dx = center[0] - point[0];
  var dy = center[1] - point[1];
  return normalizeAngle(Math.atan2(dy, dx) * (180 / Math.PI) - 90);
}

/**
 * Returns a normalized (0~360) angle.
 */
export function normalizeAngle(angle: number): number {
  if (angle < 0) angle = angle + 360;
  if (angle >= 360) angle = angle - 360;
  return angle;
}
