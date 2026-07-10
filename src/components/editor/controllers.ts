import { Editor, Manipulator, Controller } from "./editor";
import { Color, ControllerPosition, Cursor } from "./consts";
import { getBoundingRect, type Shape } from "./shapes";
import * as geometry from "./geometry";
import {
  drawBoundary,
  drawControlPoint,
  getControllerPosition,
  inControlPoint,
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
    return inControlPoint(editor.gc, p, cp);
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
  }

  update(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    switch (this.options.position) {
      case ControllerPosition.TOP: {
        editor.transform.assign(shape, "top", shape.top + this.dyStep);
        editor.transform.assign(shape, "height", shape.height - this.dyStep);
        break;
      }
      case ControllerPosition.BOTTOM: {
        editor.transform.assign(shape, "height", shape.height + this.dyStep);
        break;
      }
      case ControllerPosition.LEFT: {
        editor.transform.assign(shape, "left", shape.left + this.dxStep);
        editor.transform.assign(shape, "width", shape.width - this.dxStep);
        break;
      }
      case ControllerPosition.RIGHT: {
        editor.transform.assign(shape, "width", shape.width + this.dxStep);
        break;
      }
      case ControllerPosition.LEFT_TOP: {
        editor.transform.assign(shape, "left", shape.left + this.dxStep);
        editor.transform.assign(shape, "top", shape.top + this.dyStep);
        editor.transform.assign(shape, "width", shape.width - this.dxStep);
        editor.transform.assign(shape, "height", shape.height - this.dyStep);
        break;
      }
      case ControllerPosition.RIGHT_TOP: {
        editor.transform.assign(shape, "top", shape.top + this.dyStep);
        editor.transform.assign(shape, "width", shape.width + this.dxStep);
        editor.transform.assign(shape, "height", shape.height - this.dyStep);
        break;
      }
      case ControllerPosition.LEFT_BOTTOM: {
        editor.transform.assign(shape, "left", shape.left + this.dxStep);
        editor.transform.assign(shape, "width", shape.width - this.dxStep);
        editor.transform.assign(shape, "height", shape.height + this.dyStep);
        break;
      }
      case ControllerPosition.RIGHT_BOTTOM: {
        editor.transform.assign(shape, "width", shape.width + this.dxStep);
        editor.transform.assign(shape, "height", shape.height + this.dyStep);
        break;
      }
    }
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
