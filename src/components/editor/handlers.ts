import { Handler, Editor } from "./editor";
import { Color, Cursor, Mouse } from "./consts";
import * as geometry from "./geometry";
import { drawBox } from "./utils";
import {
  type BitmapShape,
  type EllipseShape,
  type LineShape,
  type PenShape,
  type RectangleShape,
  ShapeType,
  type TextShape,
} from "./shapes";

/**
 * Select Handler
 */
export class SelectHandler extends Handler {
  getSelectedManipulator(editor: Editor) {
    if (editor.selection.size() !== 1) return null;
    return editor.manipulators.get(editor.selection.get()[0].type);
  }

  pointerDown(editor: Editor, e: PointerEvent, point: number[]): void {
    const selectionManipulator = editor.manipulators.get("Selection");
    if (!selectionManipulator) return;
    const selectedManipulator = this.getSelectedManipulator(editor);

    if (e.button === Mouse.BUTTON1) {
      const shape = editor.getShapeAt(point);
      if (
        editor.selection.size() === 1 &&
        selectedManipulator?.mouseIn(
          editor,
          editor.selection.get()[0],
          e,
          point,
        )
      ) {
        // allow the manipulator to handle the controllers are outside the shape (e.g. resizing)
      } else if (shape) {
        // single selection
        if (e.shiftKey) {
          if (editor.selection.isSelected(shape)) {
            editor.selection.deselect(shape);
          } else {
            editor.selection.select(shape);
          }
        } else {
          if (!editor.selection.isSelected(shape)) {
            editor.selection.select(shape, true);
          }
        }
      } else if (
        editor.selection.size() > 1 &&
        // FIXME: Fix the shape parameter
        selectionManipulator.mouseIn(editor, null as any, e, point)
      ) {
        // multi selection (do nothing, let the selection manipulator handle it)
      } else {
        // area selection
        this.dragging = true;
        this.dragStartPoint = [point[0], point[1]];
      }
    }

    // delegates to manipulators
    let cursor: [string, number] = [Cursor.DEFAULT, 0];
    if (editor.selection.size() > 1) {
      if (selectionManipulator) {
        try {
          // FIXME: Fix the shape parameters
          selectionManipulator.pointerDown(editor, null as any, e, point);
          if (selectionManipulator.mouseIn(editor, null as any, e, point)) {
            cursor =
              selectionManipulator.mouseCursor(editor, null as any, e, point) ??
              cursor;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    if (editor.selection.size() === 1) {
      const shape = editor.selection.get()[0];
      const manipulator = editor.manipulators.get(shape.type);
      if (manipulator) {
        try {
          manipulator.pointerDown(editor, shape, e, point);
          if (manipulator.mouseIn(editor, shape, e, point)) {
            cursor = manipulator.mouseCursor(editor, shape, e, point) ?? cursor;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    if (Array.isArray(cursor) && cursor.length > 1) {
      editor.setCursor(cursor[0], cursor[1]);
    } else {
      editor.setCursor(Cursor.DEFAULT);
    }
  }

  pointerMove(editor: Editor, e: PointerEvent, point: number[]): void {
    const selectionManipulator = editor.manipulators.get("Selection");
    if (!selectionManipulator) return;
    const selectedManipulator = this.getSelectedManipulator(editor);

    editor.repaint(false);

    // selecting area
    if (this.dragging) {
      this.dragPoint = [point[0], point[1]];
      this.drawDragging(editor);
    } else if (
      editor.selection.size() === 1 &&
      selectedManipulator?.mouseIn(editor, editor.selection.get()[0], e, point)
    ) {
      // do nothing
    } else {
      // other shape hovering
      const shape = editor.getShapeAt(point);
      if (shape && !editor.selection.isSelected(shape)) {
        const manipulator = editor.manipulators.get(shape.type);
        if (manipulator) {
          manipulator.drawHovering(editor, shape);
        }
      }
    }

    // draw ghost over hovering
    editor.selection.drawSelection(editor);

    // delegates to manipulators
    let cursor: [string, number] = [Cursor.DEFAULT, 0];
    if (editor.selection.size() > 1) {
      try {
        // FIXME: Fix the shape parameter
        selectionManipulator.pointerMove(editor, null as any, e, point);
        if (selectionManipulator.mouseIn(editor, null as any, e, point)) {
          cursor =
            selectionManipulator.mouseCursor(editor, null as any, e, point) ??
            cursor;
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (editor.selection.size() === 1) {
      const shape = editor.selection.get()[0];
      const manipulator = editor.manipulators.get(shape.type);
      if (manipulator) {
        manipulator.pointerMove(editor, shape, e, point);
        if (
          manipulator.mouseIn(editor, shape, e, point) ||
          manipulator.isDragging()
        ) {
          cursor = manipulator.mouseCursor(editor, shape, e, point) ?? cursor;
        }
      }
    }
    if (Array.isArray(cursor) && cursor.length > 1) {
      editor.setCursor(cursor[0], cursor[1]);
    } else {
      editor.setCursor(Cursor.DEFAULT);
    }
  }

  pointerUp(editor: Editor, e: PointerEvent, point: number[]): void {
    const selectionManipulator = editor.manipulators.get("Selection");
    if (!selectionManipulator) return;

    // select area
    if (e.button === Mouse.BUTTON1 && this.dragging) {
      this.dragging = false;
      editor.repaint();
      editor.selection.selectArea(
        this.dragStartPoint[0],
        this.dragStartPoint[1],
        point[0],
        point[1],
        true,
      );
    }

    // delegates to manipulators
    let cursor: [string, number] = [Cursor.DEFAULT, 0];
    if (editor.selection.size() > 1) {
      const manipulator = editor.manipulators.get("Selection");
      if (manipulator) {
        try {
          // FIXME: Fix the shape parameter
          if (manipulator.mouseIn(editor, null as any, e, point)) {
            cursor =
              manipulator.mouseCursor(editor, null as any, e, point) ?? cursor;
          }
          manipulator.pointerUp(editor, null as any, e, point);
        } catch (e) {
          console.error(e);
        }
      }
    }
    if (editor.selection.size() === 1) {
      const s = editor.selection.get()[0];
      const manipulator = editor.manipulators.get(s.type);
      if (manipulator) {
        try {
          if (manipulator.mouseIn(editor, s, e, point)) {
            cursor = manipulator.mouseCursor(editor, s, e, point) ?? cursor;
          }
          manipulator.pointerUp(editor, s, e, point);
        } catch (e) {
          console.error(e);
        }
      }
    }
    if (Array.isArray(cursor) && cursor.length > 1) {
      editor.setCursor(cursor[0], cursor[1]);
    } else {
      editor.setCursor(Cursor.DEFAULT);
    }

    editor.repaint();
    this.dragging = false;
    this.dragStartPoint = [-1, -1];
  }

  drawDragging(editor: Editor): void {
    if (this.dragging) {
      const r = geometry.normalizeRect([this.dragStartPoint, this.dragPoint]);
      const gc = editor.gc;
      drawBox(gc, r, Color.SELECTION);
    }
  }
}

/**
 * Rectangle Factory Handler
 */
export class RectangleFactoryHandler extends Handler {
  shape: RectangleShape | null = null;

  reset() {
    super.reset();
    this.shape = null;
  }

  initialize(editor: Editor, e: PointerEvent): void {
    editor.transform.begin();
    this.shape = editor.factory.create(ShapeType.RECTANGLE) as RectangleShape;
    this.shape.left = this.dragStartPoint[0];
    this.shape.top = this.dragStartPoint[1];
    this.shape.width = 1;
    this.shape.height = 1;
    this.shape.color = 1;
    editor.transform.insert(this.shape);
  }

  update(editor: Editor, e: PointerEvent): void {
    if (!this.shape) return;
    const r = [this.dragStartPoint, this.dragPoint];
    const normalized = geometry.normalizeRect(r);
    const l = normalized[0][0];
    const t = normalized[0][1];
    const w = normalized[1][0] - normalized[0][0] + 1;
    const h = normalized[1][1] - normalized[0][1] + 1;
    editor.transform.assign(this.shape, "left", l);
    editor.transform.assign(this.shape, "top", t);
    editor.transform.assign(this.shape, "width", w);
    editor.transform.assign(this.shape, "height", h);
  }

  finalize(editor: Editor, e: PointerEvent): void {
    editor.transform.end();
  }
}

/**
 * Ellipse Factory Handler
 */
export class EllipseFactoryHandler extends Handler {
  shape: EllipseShape | null = null;

  reset() {
    super.reset();
    this.shape = null;
  }

  initialize(editor: Editor, e: PointerEvent): void {
    editor.transform.begin();
    this.shape = editor.factory.create(ShapeType.ELLIPSE) as EllipseShape;
    this.shape.left = this.dragStartPoint[0];
    this.shape.top = this.dragStartPoint[1];
    this.shape.width = 1;
    this.shape.height = 1;
    this.shape.color = 1;
    editor.transform.insert(this.shape);
  }

  update(editor: Editor, e: PointerEvent): void {
    if (!this.shape) return;
    const r = [this.dragStartPoint, this.dragPoint];
    const normalized = geometry.normalizeRect(r);
    const l = normalized[0][0];
    const t = normalized[0][1];
    const w = normalized[1][0] - normalized[0][0] + 1;
    const h = normalized[1][1] - normalized[0][1] + 1;
    editor.transform.assign(this.shape, "left", l);
    editor.transform.assign(this.shape, "top", t);
    editor.transform.assign(this.shape, "width", w);
    editor.transform.assign(this.shape, "height", h);
  }

  finalize(editor: Editor, e: PointerEvent): void {
    editor.transform.end();
  }
}

/**
 * Line Factory Handler
 */
export class LineFactoryHandler extends Handler {
  shape: LineShape | null = null;

  reset() {
    super.reset();
    this.shape = null;
  }

  initialize(editor: Editor, e: PointerEvent): void {
    editor.transform.begin();
    this.shape = editor.factory.create(ShapeType.LINE) as LineShape;
    this.shape.path = [
      [this.dragStartPoint[0], this.dragStartPoint[1]],
      [this.dragStartPoint[0], this.dragStartPoint[1]],
    ];
    this.shape.left = this.dragStartPoint[0];
    this.shape.top = this.dragStartPoint[1];
    this.shape.width = 1;
    this.shape.height = 1;
    this.shape.color = 1;
    editor.transform.insert(this.shape);
  }

  update(editor: Editor, e: PointerEvent): void {
    if (!this.shape) return;
    const r = [this.dragStartPoint, this.dragPoint];
    const normalized = geometry.normalizeRect(r);
    const l = normalized[0][0];
    const t = normalized[0][1];
    const w = normalized[1][0] - normalized[0][0] + 1;
    const h = normalized[1][1] - normalized[0][1] + 1;
    editor.transform.assign(this.shape, "path", [
      geometry.copy(this.dragStartPoint),
      geometry.copy(this.dragPoint),
    ]);
    editor.transform.assign(this.shape, "left", l);
    editor.transform.assign(this.shape, "top", t);
    editor.transform.assign(this.shape, "width", w);
    editor.transform.assign(this.shape, "height", h);
  }

  finalize(editor: Editor, e: PointerEvent): void {
    editor.transform.end();
  }
}

/**
 * Text Factory Handler
 */
export class TextFactoryHandler extends Handler {
  shape: TextShape | null = null;

  reset() {
    super.reset();
    this.shape = null;
  }

  initialize(editor: Editor, e: PointerEvent): void {
    editor.transform.begin();
    this.shape = editor.factory.create(ShapeType.TEXT) as TextShape;
    editor.gc.setFont(this.shape.font);
    const metric = editor.gc.metricText(this.shape.text);
    this.shape.left = this.dragStartPoint[0];
    this.shape.top = this.dragStartPoint[1];
    this.shape.width = metric.width;
    this.shape.height = metric.height;
    this.shape.color = 1;
    editor.transform.insert(this.shape);
  }

  update(editor: Editor, e: PointerEvent): void {}

  finalize(editor: Editor, e: PointerEvent): void {
    editor.transform.end();
  }
}

/**
 * Pen Factory Handler
 */
export class PenFactoryHandler extends Handler {
  shape: PenShape | null = null;
  pressedButton: number = -1;

  reset() {
    super.reset();
    this.pressedButton = -1;
  }

  onActivate(editor: Editor) {
    this.shape = null;
    editor.setCursor(Cursor.DEFAULT);
  }

  onDeactivate(editor: Editor) {
    if (this.dragging) {
      this.finalize(editor, {} as any);
      this.reset();
      editor.repaint();
    }
  }

  initialize(editor: Editor, e: PointerEvent): void {
    editor.transform.begin();
    if (this.shape) return;
    const newShape = editor.factory.create(ShapeType.PEN) as PenShape;
    editor.transform.insert(newShape);
    this.shape = editor.store.getShapeById(newShape.id) as PenShape;
  }

  update(editor: Editor, e: PointerEvent): void {
    if (!this.shape) return;
    if (!this.dragging) return;
    if (this.pressedButton === Mouse.BUTTON1) {
      const p = geometry.copy(this.dragPoint);
      const newPoints = [...this.shape.points, p];
      if (!this.shape.points.some((pt) => pt[0] === p[0] && pt[1] === p[1])) {
        editor.transform.assign(this.shape, "points", newPoints);
      }
    } else if (this.pressedButton === Mouse.BUTTON3) {
      const p = [this.dragPoint[0], this.dragPoint[1]];
      editor.transform.assign(this.shape, "points", [
        ...this.shape.points.filter((pt) => pt[0] !== p[0] || pt[1] !== p[1]),
      ]);
    }
  }

  finalize(editor: Editor, e: PointerEvent): void {
    if (!this.shape) return;
    const xs = this.shape.points.map((p) => p[0]);
    const ys = this.shape.points.map((p) => p[1]);
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    const right = Math.max(...xs);
    const bottom = Math.max(...ys);
    editor.transform.assign(this.shape, "left", left);
    editor.transform.assign(this.shape, "top", top);
    editor.transform.assign(this.shape, "width", right - left + 1);
    editor.transform.assign(this.shape, "height", bottom - top + 1);
    editor.transform.end();
  }

  /**
   * pointer down handler
   */
  pointerDown(editor: Editor, e: PointerEvent, point: number[]) {
    if (e.button === Mouse.BUTTON1 || e.button === Mouse.BUTTON3) {
      this.dragging = true;
      this.dragStartPoint = [point[0], point[1]];
      this.dragPoint = geometry.copy(this.dragStartPoint);
      this.pressedButton = e.button;
      this.initialize(editor, e);
      this.update(editor, e);
      editor.repaint();
      // this.drawDragging(editor, e);
    }
  }

  /**
   * pointer move handler
   */
  pointerMove(editor: Editor, e: PointerEvent, point: number[]) {
    if (this.dragging) {
      this.dragPoint = [point[0], point[1]];
      this.update(editor, e);
      editor.repaint();
      this.drawDragging(editor, e);
    } else {
      this.updateHovering(editor, e);
      editor.repaint();
      this.drawHovering(editor, e);
    }
  }

  /**
   * pointer up handler
   */
  pointerUp(editor: Editor, e: PointerEvent, point: number[]) {
    if (
      (this.pressedButton === Mouse.BUTTON1 ||
        this.pressedButton === Mouse.BUTTON3) &&
      this.dragging
    ) {
      this.finalize(editor, e);
      this.reset();
      editor.repaint();
    }
  }

  /**
   * keyDown
   */
  keyDown(editor: Editor, e: KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Enter") {
      if (
        this.shape &&
        (this.pressedButton === Mouse.BUTTON1 ||
          this.pressedButton === Mouse.BUTTON3) &&
        this.dragging
      )
        this.finalize(editor, e as any);
      this.reset();
      editor.repaint();
      this.complete(editor);
    }
    return false;
  }
}

/**
 * Bitmap Factory Handler
 */
export class BitmapFactoryHandler extends Handler {
  shape: BitmapShape | null = null;

  reset() {
    super.reset();
    this.shape = null;
  }

  initialize(editor: Editor, e: PointerEvent): void {
    editor.transform.begin();
    this.shape = editor.factory.create(ShapeType.BITMAP) as BitmapShape;
    this.shape.left = this.dragStartPoint[0];
    this.shape.top = this.dragStartPoint[1];
    // this.shape.width = 1;
    // this.shape.height = 1;
    this.shape.color = 1;
    editor.transform.insert(this.shape);
  }

  update(editor: Editor, e: PointerEvent): void {
    if (!this.shape) return;
    // const r = [this.dragStartPoint, this.dragPoint];
    // const normalized = geometry.normalizeRect(r);
    // const l = normalized[0][0];
    // const t = normalized[0][1];
    // const w = normalized[1][0] - normalized[0][0] + 1;
    // const h = normalized[1][1] - normalized[0][1] + 1;
    // editor.transform.assign(this.shape, "left", l);
    // editor.transform.assign(this.shape, "top", t);
    // editor.transform.assign(this.shape, "width", w);
    // editor.transform.assign(this.shape, "height", h);
  }

  finalize(editor: Editor, e: PointerEvent): void {
    editor.transform.end();
  }
}
