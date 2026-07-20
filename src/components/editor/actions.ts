import type { Editor } from "./editor";
import {
  ShapeType,
  type LineShape,
  type PenShape,
  type Shape,
  type ShapeProps,
  type TextShape,
} from "./shapes";
import * as geometry from "./geometry";

export class PredefinedActions {
  editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * Undo
   */
  undo() {
    this.editor.transform.undo();
    this.editor.repaint();
  }

  /**
   * Redo
   */
  redo() {
    this.editor.transform.redo();
    this.editor.repaint();
  }

  /**
   * Update properties of shapes in the editor. If no shapes are provided, it will update the currently selected shapes.
   */
  update(props: ShapeProps, shapes?: Shape[], asAction: boolean = true) {
    const shapesToUpdate =
      shapes && shapes.length > 0 ? shapes : this.editor.selection.get();
    if (asAction) this.editor.transform.begin();
    for (let key in props) {
      const value = (props as any)[key];
      for (const shape of shapesToUpdate) {
        if (shape.hasOwnProperty(key)) {
          if (key === "left") {
            if (shape.type === ShapeType.LINE) {
              const s = shape as LineShape;
              const oldLeft = s.left;
              const dx = value - oldLeft;
              const ps = geometry.movePath(s.path, dx, 0);
              this.editor.transform.assign(shape, "path", ps);
            } else if (shape.type === ShapeType.PEN) {
              const s = shape as PenShape;
              const oldLeft = s.left;
              const dx = value - oldLeft;
              const ps = geometry.movePath(s.points, dx, 0);
              this.editor.transform.assign(shape, "points", ps);
            }
          } else if (key === "top") {
            if (shape.type === ShapeType.LINE) {
              const s = shape as LineShape;
              const oldTop = s.top;
              const dy = value - oldTop;
              const ps = geometry.movePath(s.path, 0, dy);
              this.editor.transform.assign(shape, "path", ps);
            } else if (shape.type === ShapeType.PEN) {
              const s = shape as PenShape;
              const oldTop = s.top;
              const dy = value - oldTop;
              const ps = geometry.movePath(s.points, 0, dy);
              this.editor.transform.assign(shape, "points", ps);
            }
          } else if (key === "font") {
            if (shape.type === ShapeType.TEXT) {
              const s = shape as TextShape;
              this.editor.gc.setFont(value);
              const m = this.editor.gc.metricText(s.text);
              this.editor.transform.assign(shape, "width", m.width);
              this.editor.transform.assign(shape, "height", m.height);
            }
          } else if (key === "text") {
            if (shape.type === ShapeType.TEXT) {
              const s = shape as TextShape;
              this.editor.gc.setFont(s.font);
              const m = this.editor.gc.metricText(value);
              this.editor.transform.assign(shape, "width", m.width);
              this.editor.transform.assign(shape, "height", m.height);
            }
          } else if (key === "direction") {
            if (shape.type === ShapeType.TEXT) {
              const s = shape as TextShape;
              const m = this.editor.gc.metricText(s.text);
              const cx = s.left + s.width / 2;
              const cy = s.top + s.height / 2;
              if (value === 0 || value === 2) {
                // horizontal
                this.editor.transform.assign(shape, "width", m.width);
                this.editor.transform.assign(shape, "height", m.height);
                this.editor.transform.assign(
                  shape,
                  "left",
                  Math.round(cx - m.width / 2),
                );
                this.editor.transform.assign(
                  shape,
                  "top",
                  Math.round(cy - m.height / 2),
                );
              } else if (value === 1 || value === 3) {
                // vertical
                this.editor.transform.assign(shape, "width", m.height);
                this.editor.transform.assign(shape, "height", m.width);
                this.editor.transform.assign(
                  shape,
                  "left",
                  Math.round(cx - m.height / 2),
                );
                this.editor.transform.assign(
                  shape,
                  "top",
                  Math.round(cy - m.width / 2),
                );
              }
            }
          }
          this.editor.transform.assign(shape, key, value);
        }
      }
    }
    if (asAction) this.editor.transform.end();
    if (asAction) this.editor.repaint();
  }

  /**
   * Moves the shapes
   */
  move(shapes: Shape[], dx: number, dy: number, asAction: boolean = true) {
    if (dx === 0 && dy === 0) return;
    const shapesToMove =
      shapes && shapes.length > 0 ? shapes : this.editor.selection.get();
    if (asAction) this.editor.transform.begin();
    for (let s of shapesToMove) {
      this.editor.transform.assign(s, "left", s.left + dx);
      this.editor.transform.assign(s, "top", s.top + dy);
      switch (s.type) {
        case ShapeType.LINE: {
          const line = s as LineShape;
          this.editor.transform.assign(
            line,
            "path",
            geometry.movePath(line.path, dx, dy),
          );
          break;
        }
        case ShapeType.PEN: {
          const pen = s as PenShape;
          this.editor.transform.assign(
            pen,
            "points",
            geometry.movePath(pen.points, dx, dy),
          );
          break;
        }
      }
    }
    if (asAction) this.editor.transform.end();
    if (asAction) this.editor.repaint();
  }

  /**
   * Bring shapes forward in the z-order.
   */
  bringForward(shapes: Shape[] = [], asAction: boolean = true) {
    const shapesToBring =
      shapes.length > 0 ? shapes : this.editor.selection.get();
    if (asAction) this.editor.transform.begin();
    for (const shape of shapesToBring) {
      const index = this.editor.store.shapes.indexOf(shape);
      if (index < this.editor.store.shapes.length - 1) {
        this.editor.transform.reorder(shape, index + 1);
      }
    }
    if (asAction) this.editor.transform.end();
    if (asAction) this.editor.repaint();
  }

  /**
   * Send shapes backward in the z-order.
   */
  sendBackward(shapes: Shape[] = [], asAction: boolean = true) {
    const shapesToSend =
      shapes.length > 0 ? shapes : this.editor.selection.get();
    if (asAction) this.editor.transform.begin();
    for (const shape of shapesToSend) {
      const index = this.editor.store.shapes.indexOf(shape);
      if (index > 0) {
        this.editor.transform.reorder(shape, index - 1);
      }
    }
    if (asAction) this.editor.transform.end();
    if (asAction) this.editor.repaint();
  }

  /**
   * Bring shapes to the front.
   */
  bringToFront(shapes: Shape[] = [], asAction: boolean = true) {
    const shapesToBring =
      shapes.length > 0 ? shapes : this.editor.selection.get();
    if (asAction) this.editor.transform.begin();
    for (const shape of shapesToBring) {
      this.editor.transform.reorder(shape, this.editor.store.shapes.length - 1);
    }
    if (asAction) this.editor.transform.end();
    if (asAction) this.editor.repaint();
  }

  /**
   * Send shapes to the back.
   */
  sendToBack(shapes: Shape[] = [], asAction: boolean = true) {
    const shapesToSend =
      shapes.length > 0 ? shapes : this.editor.selection.get();
    if (asAction) this.editor.transform.begin();
    for (const shape of shapesToSend) {
      this.editor.transform.reorder(shape, 0);
    }
    if (asAction) this.editor.transform.end();
    if (asAction) this.editor.repaint();
  }
}
