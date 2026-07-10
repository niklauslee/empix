import { Handler, Editor } from "./editor";
import { Color, Cursor, Mouse } from "./consts";
import * as geometry from "./geometry";
import { drawBoundary } from "./utils";
import {
  type EllipseShape,
  type LineShape,
  type RectangleShape,
  ShapeType,
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
            editor.selection.clear();
            editor.selection.select(shape);
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
        if (!e.shiftKey) {
          editor.selection.clear();
        }
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
      drawBoundary(gc, r[0][0], r[0][1], r[1][0], r[1][1], Color.SELECTION);
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
    this.shape.color = "#000000";
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
    this.shape.color = "#000000";
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
    this.shape.x1 = this.dragStartPoint[0];
    this.shape.y1 = this.dragStartPoint[1];
    this.shape.x2 = this.dragStartPoint[0];
    this.shape.y2 = this.dragStartPoint[1];
    this.shape.left = this.dragStartPoint[0];
    this.shape.top = this.dragStartPoint[1];
    this.shape.width = 1;
    this.shape.height = 1;
    this.shape.color = "#000000";
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
    editor.transform.assign(this.shape, "x1", this.dragStartPoint[0]);
    editor.transform.assign(this.shape, "y1", this.dragStartPoint[1]);
    editor.transform.assign(this.shape, "x2", this.dragPoint[0]);
    editor.transform.assign(this.shape, "y2", this.dragPoint[1]);
    editor.transform.assign(this.shape, "left", l);
    editor.transform.assign(this.shape, "top", t);
    editor.transform.assign(this.shape, "width", w);
    editor.transform.assign(this.shape, "height", h);
  }

  finalize(editor: Editor, e: PointerEvent): void {
    editor.transform.end();
  }
}
