import { Editor, Manipulator, Controller } from "./editor";
import {
  LINE_STRATIFY_ANGLE_THRESHOLD,
  Color,
  ControllerPosition,
  Cursor,
  CONTROL_LINE_WIDTH,
} from "./consts";
import {
  getBoundingRect,
  ShapeType,
  type LineShape,
  type Shape,
} from "./shapes";
import * as geometry from "./geometry";
import {
  drawBoundary,
  drawControlPoint,
  findControlPoint,
  findSegmentControlPoint,
  getControllerPosition,
  inControlPoint,
  reducePath,
} from "./utils";
import { containsPoint } from "./shapes";

/**
 * Controller for moving selections
 */
export class SelectionMoveController extends Controller {
  active(editor: Editor, shape: Shape): boolean {
    return editor.selection.size() > 1;
  }

  mouseIn(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): boolean {
    for (let s of editor.selection.get()) {
      if (containsPoint(s, point)) return true;
    }
    return false;
  }

  mouseCursor(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): [string, number] {
    return [Cursor.MOVE, 0];
  }

  initialize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    editor.transform.begin();
  }

  update(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    if (this.dxStep === 0 && this.dyStep === 0) return;
    const selections = editor.selection.get();
    for (let s of selections) {
      editor.transform.assign(s, "left", s.left + this.dxStep);
      editor.transform.assign(s, "top", s.top + this.dyStep);
      switch (s.type) {
        case ShapeType.LINE: {
          const line = s as LineShape;
          editor.transform.assign(
            line,
            "path",
            geometry.movePath(line.path, this.dxStep, this.dyStep),
          );
          break;
        }
      }
    }
  }

  finalize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    editor.transform.end();
  }

  draw(editor: Editor, shape: Shape) {
    const r = editor.selection.getBoundingRect();
    drawBoundary(
      editor.gc,
      r[0][0],
      r[0][1],
      r[1][0],
      r[1][1],
      Color.SELECTION,
    );
  }
}

/**
 * Moving controller for box-type shapes
 */
export class BoxMoveController extends Controller {
  mouseCursor(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): [string, number] {
    return [Cursor.MOVE, 0];
  }

  active(editor: Editor, shape: Shape) {
    return editor.selection.size() === 1 && editor.selection.isSelected(shape);
  }

  initialize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    editor.transform.begin();
  }

  update(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    if (this.dxStep === 0 && this.dyStep === 0) return;
    editor.transform.assign(shape, "left", shape.left + this.dxStep);
    editor.transform.assign(shape, "top", shape.top + this.dyStep);
  }

  finalize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    editor.transform.end();
  }

  draw(editor: Editor, shape: Shape) {
    let r = getBoundingRect(shape);
    drawBoundary(
      editor.gc,
      r[0][0],
      r[0][1],
      r[1][0],
      r[1][1],
      Color.SELECTION,
    );
  }
}

/**
 * Options for box sizing controller
 */
interface BoxSizeControllerOptions {
  position: string;
}

/**
 * Sizing controller for box-type shapes
 */
export class BoxSizeController extends Controller {
  options: BoxSizeControllerOptions;
  initialRect: number[][] = [];

  constructor(
    manipulator: Manipulator,
    options: Partial<BoxSizeControllerOptions>,
  ) {
    super(manipulator);
    this.options = {
      position: ControllerPosition.RIGHT_BOTTOM,
      ...options,
    };
  }

  active(editor: Editor, shape: Shape): boolean {
    return editor.selection.size() === 1 && editor.selection.isSelected(shape);
  }

  mouseIn(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    const p = [e.offsetX, e.offsetY];
    const cp = getControllerPosition(editor.gc, shape, this.options.position);
    return inControlPoint(p, cp);
  }

  mouseCursor(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): [string, number] {
    let angle = 0;
    switch (this.options.position) {
      case ControllerPosition.LEFT:
      case ControllerPosition.RIGHT:
        angle += 90;
        break;
      case ControllerPosition.LEFT_TOP:
      case ControllerPosition.RIGHT_BOTTOM:
        angle += 135;
        break;
      case ControllerPosition.RIGHT_TOP:
      case ControllerPosition.LEFT_BOTTOM:
        angle += 45;
        break;
    }
    angle = geometry.normalizeAngle(angle);
    if (angle >= 180) angle -= 180;
    return [Cursor.RESIZE, angle];
  }

  initialize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    editor.transform.begin();
    this.initialRect = getBoundingRect(shape);
  }

  update(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    if (this.dxStep === 0 && this.dyStep === 0) return;
    const r = geometry.copyRect(this.initialRect);
    switch (this.options.position) {
      case ControllerPosition.TOP:
        r[0][1] += this.dy;
        break;
      case ControllerPosition.BOTTOM:
        r[1][1] += this.dy;
        break;
      case ControllerPosition.LEFT:
        r[0][0] += this.dx;
        break;
      case ControllerPosition.RIGHT:
        r[1][0] += this.dx;
        break;
      case ControllerPosition.LEFT_TOP:
        r[0][0] += this.dx;
        r[0][1] += this.dy;
        break;
      case ControllerPosition.RIGHT_TOP:
        r[1][0] += this.dx;
        r[0][1] += this.dy;
        break;
      case ControllerPosition.LEFT_BOTTOM:
        r[0][0] += this.dx;
        r[1][1] += this.dy;
        break;
      case ControllerPosition.RIGHT_BOTTOM:
        r[1][0] += this.dx;
        r[1][1] += this.dy;
        break;
    }
    const nr = geometry.normalizeRect(r);
    editor.transform.assign(shape, "left", nr[0][0]);
    editor.transform.assign(shape, "top", nr[0][1]);
    editor.transform.assign(shape, "width", geometry.width(nr) + 1);
    editor.transform.assign(shape, "height", geometry.height(nr) + 1);
  }

  finalize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    editor.transform.end();
  }

  draw(editor: Editor, shape: Shape) {
    const gc = editor.gc;
    const cp = getControllerPosition(gc, shape, this.options.position);
    drawControlPoint(gc, cp[0], cp[1]);
  }
}

/**
 * Moving controller for line shape
 */
export class LineMoveController extends Controller {
  active(editor: Editor, shape: Shape) {
    return editor.selection.size() === 1 && editor.selection.isSelected(shape);
  }

  mouseCursor(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): [string, number] {
    return [Cursor.MOVE, 0];
  }

  initialize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    editor.transform.begin();
  }

  update(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    if (this.dxStep === 0 && this.dyStep === 0) return;
    const s = shape as LineShape;
    editor.transform.assign(s, "left", s.left + this.dxStep);
    editor.transform.assign(s, "top", s.top + this.dyStep);
    editor.transform.assign(
      s,
      "path",
      geometry.movePath(s.path, this.dxStep, this.dyStep),
    );
  }

  finalize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    editor.transform.end();
  }

  draw(editor: Editor, shape: Shape) {
    const s = shape as LineShape;
    const r = getBoundingRect(s);
    drawBoundary(
      editor.gc,
      r[0][0],
      r[0][1],
      r[1][0],
      r[1][1],
      Color.SELECTION,
    );
    const sp = editor.gc.toCanvasCoord(s.path[0], true);
    const p2 = editor.gc.toCanvasCoord(s.path[s.path.length - 1], true);
    const gc = editor.gc;
    gc.context.save();
    gc.context.scale(gc.ratio, gc.ratio);
    gc.context.strokeStyle = Color.SELECTION;
    gc.context.lineWidth = CONTROL_LINE_WIDTH;
    gc.context.beginPath();
    gc.context.moveTo(sp[0], sp[1]);
    for (let i = 1; i < s.path.length; i++) {
      const p = editor.gc.toCanvasCoord(s.path[i], true);
      gc.context.lineTo(p[0], p[1]);
    }
    gc.context.stroke();
    gc.context.restore();
  }
}

/**
 * Moving controller for line's points shape
 */
export class LineMovePointController extends Controller {
  /**
   * current control point
   */
  controlPoint: number = -1;

  active(editor: Editor, shape: Shape): boolean {
    return (
      editor.selection.size() === 1 &&
      editor.selection.isSelected(shape) &&
      shape.type === ShapeType.LINE
    );
  }

  mouseIn(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): boolean {
    const p = [e.offsetX, e.offsetY];
    const s = shape as LineShape;
    let cpIndex = findControlPoint(s, point);
    if (cpIndex >= 0) {
      const cp = editor.gc.toCanvasCoord(s.path[cpIndex], true);
      return inControlPoint(p, cp);
    }
    return false;
  }

  mouseCursor(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): [string, number] {
    return [Cursor.POINTER, 0];
  }

  initialize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    this.controlPoint = findControlPoint(shape as LineShape, point);
    editor.transform.begin();
  }

  update(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    if (this.dxStep === 0 && this.dyStep === 0) return;
    const s = shape as LineShape;
    if (this.controlPoint < 0 || this.controlPoint >= s.path.length) return;
    const newPath = geometry.copyPath(s.path);
    newPath[this.controlPoint] = geometry.move(
      newPath[this.controlPoint],
      this.dxStep,
      this.dyStep,
    );
    const rect = geometry.boundingRect(newPath);
    editor.transform.assign(s, "path", newPath);
    editor.transform.assign(s, "left", rect[0][0]);
    editor.transform.assign(s, "top", rect[0][1]);
    editor.transform.assign(s, "width", geometry.width(rect) + 1);
    editor.transform.assign(s, "height", geometry.height(rect) + 1);
  }

  finalize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    const reducedPath = reducePath(
      (shape as LineShape).path,
      LINE_STRATIFY_ANGLE_THRESHOLD,
    );
    editor.transform.assign(shape, "path", reducedPath);
    editor.transform.end();
  }

  draw(editor: Editor, shape: Shape) {
    const s = shape as LineShape;
    for (let i = 0; i < s.path.length; i++) {
      const cp = editor.gc.toCanvasCoord(s.path[i], true);
      drawControlPoint(editor.gc, cp[0], cp[1], 1);
    }
  }
}

/**
 * Moving controller for adding a line point
 */
export class LineAddPointController extends Controller {
  /**
   * current control point
   */
  controlPoint: number = -1;

  /**
   * current control path
   */
  controlPath: number[][] = [];

  active(editor: Editor, shape: Shape): boolean {
    return (
      editor.selection.size() === 1 &&
      editor.selection.isSelected(shape) &&
      shape.type === ShapeType.LINE
    );
  }

  mouseIn(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): boolean {
    const p = [e.offsetX, e.offsetY];
    const s = shape as LineShape;
    const cp = findSegmentControlPoint(editor.gc, s, p);
    return cp >= 0;
  }

  mouseCursor(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): [string, number] {
    return [Cursor.POINTER, 0];
  }

  initialize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    const p = [e.offsetX, e.offsetY];
    this.controlPoint = findSegmentControlPoint(
      editor.gc,
      shape as LineShape,
      p,
    );
    this.controlPath = geometry.copyPath((shape as LineShape).path);
    editor.transform.begin();
  }

  update(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    if (this.dxStep === 0 && this.dyStep === 0) return;
    if (this.controlPoint < 0) return;
    const s = shape as LineShape;
    let newPath = geometry.copyPath(this.controlPath);
    newPath.splice(
      this.controlPoint + 1,
      0,
      geometry.quantize(
        geometry.mid(
          newPath[this.controlPoint],
          newPath[this.controlPoint + 1],
        ),
      ),
    );
    newPath[this.controlPoint + 1][0] += this.dx;
    newPath[this.controlPoint + 1][1] += this.dy;
    const rect = geometry.boundingRect(newPath);
    editor.transform.assign(s, "path", newPath);
    editor.transform.assign(s, "left", rect[0][0]);
    editor.transform.assign(s, "top", rect[0][1]);
    editor.transform.assign(s, "width", geometry.width(rect) + 1);
    editor.transform.assign(s, "height", geometry.height(rect) + 1);
  }

  finalize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    editor.transform.end();
  }

  draw(editor: Editor, shape: Shape) {
    const s = shape as LineShape;
    if (s.path.length > 1) {
      for (let i = 0; i < s.path.length - 1; i++) {
        const p1 = editor.gc.toCanvasCoord(s.path[i], true);
        const p2 = editor.gc.toCanvasCoord(s.path[i + 1], true);
        const mid = geometry.mid(p1, p2);
        drawControlPoint(editor.gc, mid[0], mid[1], 4);
      }
    }
  }
}
