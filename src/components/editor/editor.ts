import { GraphicContext, type GraphicContextOptions } from "./graphics";
import { Color, Mouse } from "./consts";
import {
  containsPoint,
  getBoundingRect,
  type LineShape,
  move,
  overlapRect,
  type PenShape,
  render,
  renderOutline,
  type Shape,
  ShapeFactory,
  type ShapeProps,
  ShapeType,
} from "./shapes";
import * as geometry from "./geometry";
import { Transform } from "./transform";
import { Store } from "./store";
import { getAvailableFonts, loadFont } from "./font";
import { nanoid } from "nanoid";
import { TypedEvent } from "./std";
import { Clipboard } from "./clipboard";

export interface HandlerOptions {
  defaultLock: boolean;
}

/**
 * Handler for editor events
 */
export abstract class Handler {
  id: string;
  options: HandlerOptions;
  dragging: boolean;
  dragStartPoint: number[];
  dragPoint: number[];

  constructor(id: string, options?: Partial<HandlerOptions>) {
    this.id = id;
    this.options = { defaultLock: false, ...options };
    this.dragging = false;
    this.dragStartPoint = [-1, -1];
    this.dragPoint = [-1, -1];
  }

  /**
   * Reset the states of handler
   */
  reset() {
    this.dragging = false;
    this.dragStartPoint = [-1, -1];
    this.dragPoint = [-1, -1];
  }

  /**
   * Trigger when the handler action is complete
   */
  complete(editor: Editor) {
    if (!editor.handlers.activeHandlerLock) {
      editor.handlers.setActiveHandler(editor.handlers.defaultHandlerId);
    }
  }

  /**
   * Activate the handler
   */
  activate(editor: Editor) {
    editor.handlers.setActiveHandlerLock(this.options.defaultLock);
    this.onActivate(editor);
  }

  /**
   * Deactivate the handler
   */
  deactivate(editor: Editor) {
    this.onDeactivate(editor);
  }

  /**
   * Triggered when activated
   */
  onActivate(editor: Editor) {}

  /**
   * Triggered when deactivate
   */
  onDeactivate(editor: Editor) {}

  /**
   * Initialize handler
   */
  initialize(editor: Editor, e: PointerEvent): void {}

  /**
   * Update handler
   */
  update(editor: Editor, e: PointerEvent): void {}

  /**
   * Update handler when hovering (not dragging)
   */
  updateHovering(editor: Editor, e: PointerEvent): void {}

  /**
   * Finalize handler
   */
  finalize(editor: Editor, e: PointerEvent): void {}

  /**
   * pointer down handler
   */
  pointerDown(editor: Editor, e: PointerEvent, point: number[]) {
    if (e.button === Mouse.BUTTON1) {
      this.dragging = true;
      this.dragStartPoint = [point[0], point[1]];
      this.dragPoint = geometry.copy(this.dragStartPoint);
      this.initialize(editor, e);
      editor.repaint();
      this.drawDragging(editor, e);
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
    if (e.button === Mouse.BUTTON1 && this.dragging) {
      this.finalize(editor, e);
      editor.repaint();
      this.reset();
      this.complete(editor);
    }
  }

  /**
   * keyDown
   */
  keyDown(editor: Editor, e: KeyboardEvent) {
    if (e.key === "Escape" && this.dragging) {
      editor.transform.cancel();
      editor.repaint();
      this.reset();
      this.complete(editor);
    }
    return false;
  }

  /**
   * Draw ghost for the selected shape
   */
  drawSelection(editor: Editor) {}

  /**
   * Draw hovering
   */
  drawHovering(editor: Editor, e: PointerEvent) {}

  /**
   * Draw dragging
   */
  drawDragging(editor: Editor, e: PointerEvent) {}
}

/**
 * Manager for editor handlers
 */
export class HandlerManager {
  /**
   * The editor reference.
   */
  editor: Editor;

  /**
   * Handlers registered in the manager
   */
  handlers: Record<string, Handler>;

  /**
   * The default handler ID
   */
  defaultHandlerId: string;

  /**
   * The active handler
   */
  activeHandler: Handler | null;

  /**
   * Indicate whether the active handler is locked or not.
   */
  activeHandlerLock: boolean;

  /**
   * The event emitter for active handler change
   */
  onActiveHandlerChange: TypedEvent<string>;

  /**
   * The event emitter for active handler lock change
   */
  onActiveHandlerLockChange: TypedEvent<boolean>;

  constructor(
    editor: Editor,
    handlers: Handler[] = [],
    defaultHandlerId: string = "",
  ) {
    this.editor = editor;
    this.handlers = {};
    this.defaultHandlerId = defaultHandlerId;
    this.activeHandler = null;
    this.activeHandlerLock = false;
    this.onActiveHandlerChange = new TypedEvent<string>();
    this.onActiveHandlerLockChange = new TypedEvent<boolean>();
    handlers.forEach((handler) => {
      this.handlers[handler.id] = handler;
    });
  }

  /**
   * Set the active handler by its ID.
   */
  setActiveHandler(handlerId: string) {
    const handler = this.handlers[handlerId];
    if (!handler) {
      throw new Error(`Handler ${handlerId} not found`);
    }
    if (this.activeHandler !== handler) {
      if (this.activeHandler) {
        this.activeHandler.deactivate(this.editor);
      }
      if (handler) {
        this.activeHandler = handler;
        this.activeHandler.activate(this.editor);
        this.onActiveHandlerChange.emit(handlerId);
      }
    }
  }

  /**
   * Set the active handler lock state.
   */
  setActiveHandlerLock(lock: boolean) {
    this.activeHandlerLock = lock;
    this.onActiveHandlerLockChange.emit(lock);
  }

  /**
   * pointer down handler
   */
  pointerDown(editor: Editor, e: PointerEvent, point: number[]) {
    if (this.activeHandler) {
      this.activeHandler.pointerDown(editor, e, point);
    }
  }

  /**
   * pointer move handler
   */
  pointerMove(editor: Editor, e: PointerEvent, point: number[]) {
    if (this.activeHandler) {
      this.activeHandler.pointerMove(editor, e, point);
    }
  }

  /**
   * pointer up handler
   */
  pointerUp(editor: Editor, e: PointerEvent, point: number[]) {
    if (this.activeHandler) {
      this.activeHandler.pointerUp(editor, e, point);
    }
  }
}

/**
 * Manipulator for shape manipulation
 */
export class Manipulator {
  controllers: Controller[];
  draggingController: Controller | null;

  constructor() {
    this.controllers = [];
    this.draggingController = null;
  }

  /**
   * Returns one of controllers is dragging or not
   */
  isDragging(): boolean {
    return this.controllers.some((cp) => cp.dragging);
  }

  /**
   * Returns true if mouse cursor is inside the shape or control points
   */
  mouseIn(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): boolean {
    return this.controllers.some(
      (cp) => cp.active(editor, shape) && cp.mouseIn(editor, shape, e, point),
    );
  }

  /**
   * Returns mouse cursor for the manipulator
   * @returns cursor object
   */
  mouseCursor(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): [string, number] | null {
    // dragging controller has higher priority
    for (let c of this.controllers) {
      if (c.dragging) return c.mouseCursor(editor, shape, e, point);
    }
    for (let c of this.controllers) {
      if (c.active(editor, shape) && c.mouseIn(editor, shape, e, point)) {
        return c.mouseCursor(editor, shape, e, point);
      }
    }
    return null;
  }

  /**
   * Handle pointer down and return handled or not.
   */
  pointerDown(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    let handled = false;
    for (let cp of this.controllers) {
      if (cp.active(editor, shape) && cp.mouseIn(editor, shape, e, point)) {
        handled = cp.pointerDown(editor, shape, e, point);
        if (handled) {
          this.draggingController = cp;
          break;
        }
      }
    }
    return handled;
  }

  /**
   * Handle pointer move and return handled or not.
   */
  pointerMove(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    if (
      this.mouseIn(editor, shape, e, point) &&
      !editor.selection.isSelected(shape)
    ) {
      this.drawHovering(editor, shape);
    }
    let handled = false;
    if (this.draggingController) {
      handled = this.draggingController.pointerMove(editor, shape, e, point);
    }
    return handled;
  }

  /**
   * Handle pointer up and return handled or not.
   */
  pointerUp(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    let handled = false;
    if (this.draggingController) {
      handled = this.draggingController.pointerUp(editor, shape, e, point);
    }
    this.draggingController = null;
    return handled;
  }

  /**
   * Draw controllers
   */
  draw(editor: Editor, shape: Shape) {
    if (!this.draggingController) {
      for (let i = this.controllers.length - 1; i >= 0; i--) {
        const cp = this.controllers[i];
        if (cp.active(editor, shape)) {
          cp.draw(editor, shape);
        }
      }
    }
  }

  /**
   * Draw hovering effect
   */
  drawHovering(editor: Editor, shape: Shape) {
    if (!shape) return;
    renderOutline(editor.gc, shape);
    this.controllers.forEach(
      (cp) => cp.active(editor, shape) && cp.drawHovering(editor, shape),
    );
  }
}

/**
 * Manager for manipulators
 */
export class ManipulatorManager {
  manipulators: Record<string, Manipulator> = {};

  constructor(manipulators: Record<string, Manipulator> = {}) {
    Object.keys(manipulators).forEach((key) => {
      this.manipulators[key] = manipulators[key];
    });
  }

  /**
   * Get a manipulator by shape type.
   */
  get(shapeType: string): Manipulator | null {
    const manipulator = this.manipulators[shapeType];
    return manipulator ?? null;
  }
}

/**
 * Controller
 */
export class Controller {
  manipulator: Manipulator;
  dragging: boolean;
  dragStartPoint: number[];
  dragPrevPoint: number[];
  dragPoint: number[];
  dx: number;
  dy: number;
  dxStep: number;
  dyStep: number;

  constructor(manipulator: Manipulator) {
    this.manipulator = manipulator;
    this.dragging = false;
    this.dragStartPoint = [-1, -1];
    this.dragPrevPoint = [-1, -1];
    this.dragPoint = [-1, -1];
    this.dx = 0;
    this.dy = 0;
    this.dxStep = 0;
    this.dyStep = 0;
  }

  /**
   * Reset the states of controller
   */
  reset() {
    this.dragging = false;
    this.dragStartPoint = [-1, -1];
    this.dragPrevPoint = [-1, -1];
    this.dragPoint = [-1, -1];
    this.dx = 0;
    this.dy = 0;
    this.dxStep = 0;
    this.dyStep = 0;
  }

  /**
   * Indicates the controller is active or not
   */
  active(editor: Editor, shape: Shape): boolean {
    return true;
  }

  /**
   * Returns true if mouse cursor is inside the controller.
   * Default implementation returns true if the point inside the shape.
   */
  mouseIn(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): boolean {
    return containsPoint(shape, point);
  }

  /**
   * Returns mouse cursor for the controller
   * @returns cursor object (null is default cursor)
   */
  mouseCursor(
    editor: Editor,
    shape: Shape,
    e: PointerEvent,
    point: number[],
  ): [string, number] | null {
    return null;
  }

  /**
   * Initialize before dragging
   */
  initialize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {}

  /**
   * Update ghost
   */
  update(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {}

  /**
   * Finalize shape by ghost
   */
  finalize(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {}

  /**
   * Draw controller
   */
  draw(editor: Editor, shape: Shape) {}

  /**
   * Draw on dragging
   */
  drawDragging(editor: Editor, shape: Shape) {}

  /**
   * Draw on hovering
   */
  drawHovering(editor: Editor, shape: Shape) {}

  /**
   * Handle pointer down and return handled or not.
   */
  pointerDown(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    let handled = false;
    if (e.button === Mouse.BUTTON1 && this.mouseIn(editor, shape, e, point)) {
      this.reset();
      this.dragging = true;
      this.dragStartPoint = [point[0], point[1]];
      this.dragPrevPoint = geometry.copy(this.dragStartPoint);
      this.dragPoint = geometry.copy(this.dragStartPoint);
      handled = true;
      this.initialize(editor, shape, e, point);
      this.update(editor, shape, e, point);
      editor.repaint();
      this.drawDragging(editor, shape);
    }
    return handled;
  }

  /**
   * Handle pointer move and return handled or not.
   */
  pointerMove(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    let handled = false;
    if (this.dragging) {
      this.dragPrevPoint = geometry.copy(this.dragPoint);
      this.dragPoint = [point[0], point[1]];
      this.dx = this.dragPoint[0] - this.dragStartPoint[0];
      this.dy = this.dragPoint[1] - this.dragStartPoint[1];
      this.dxStep = this.dragPoint[0] - this.dragPrevPoint[0];
      this.dyStep = this.dragPoint[1] - this.dragPrevPoint[1];
      handled = true;
      this.update(editor, shape, e, point);
      editor.repaint();
      this.drawDragging(editor, shape);
    }
    return handled;
  }

  /**
   * Handle pointer up and return handled or not.
   */
  pointerUp(editor: Editor, shape: Shape, e: PointerEvent, point: number[]) {
    let handled = false;
    if (e.button === Mouse.BUTTON1 && this.dragging) {
      this.finalize(editor, shape, e, point);
      this.reset();
      handled = true;
      editor.repaint();
    }
    return handled;
  }
}

/**
 * Selection manager for editor
 */
class SelectionManager {
  /**
   * The editor reference.
   */
  editor: Editor;

  /**
   * The selected shapes.
   */
  shapes: Set<Shape>;

  /**
   * Event triggered when the selection changes.
   */
  onChange: TypedEvent<Shape[]>;

  constructor(editor: Editor) {
    this.editor = editor;
    this.shapes = new Set();
    this.onChange = new TypedEvent<Shape[]>();
  }

  /**
   * Clear the selection
   */
  clear() {
    if (this.shapes.size > 0) {
      this.shapes.clear();
      this.onChange.emit(this.get());
    }
  }

  /**
   * Return the number of selected shapes
   */
  size(): number {
    return this.shapes.size;
  }

  /**
   * Return the selected shapes
   */
  get(): Shape[] {
    return Array.from(this.shapes);
  }

  /**
   * Check if a shape is selected
   */
  isSelected(shape: Shape): boolean {
    return this.shapes.has(shape);
  }

  /**
   * Select a shape
   */
  select(shape: Shape, clear: boolean = false) {
    if (clear) {
      this.shapes.clear();
    }
    if (!this.shapes.has(shape)) {
      this.shapes.add(shape);
      this.onChange.emit(this.get());
    }
  }

  /**
   * Select multiple shapes
   */
  selectMultiple(shapes: Shape[], clear: boolean = false) {
    if (clear) {
      this.shapes.clear();
    }
    let changed = false;
    for (const shape of shapes) {
      if (!this.shapes.has(shape)) {
        this.shapes.add(shape);
        changed = true;
      }
    }
    if (changed) {
      this.onChange.emit(this.get());
    }
  }

  /**
   * Select shapes in the given area
   */
  selectArea(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    clear: boolean = false,
  ) {
    const rect = geometry.normalizeRect([
      [x1, y1],
      [x2, y2],
    ]);
    if (clear) {
      this.shapes.clear();
    }
    for (const shape of this.editor.store.shapes) {
      if (overlapRect(shape, rect)) {
        this.shapes.add(shape);
      }
    }
    this.onChange.emit(this.get());
  }

  /**
   * Select all shapes in the editor
   */
  selectAll() {
    this.shapes.clear();
    let changed = false;
    for (const shape of this.editor.store.shapes) {
      if (!this.shapes.has(shape)) {
        this.shapes.add(shape);
        changed = true;
      }
    }
    if (changed) {
      this.onChange.emit(this.get());
    }
  }

  /**
   * Deselect a shape
   */
  deselect(shape: Shape) {
    if (this.shapes.has(shape)) {
      this.shapes.delete(shape);
      this.onChange.emit(this.get());
    }
  }

  /**
   * Returns bounding rect of selected shapes
   */
  getBoundingRect(): number[][] {
    if (this.shapes.size === 0)
      return [
        [0, 0],
        [0, 0],
      ];
    return this.get()
      .map((shape) => getBoundingRect(shape))
      .reduce(geometry.unionRect);
  }

  /**
   * Draw the selection on the editor
   */
  drawSelection(editor: Editor) {
    // delegates to manipulators
    if (editor.selection.size() > 1) {
      const manipulator = editor.manipulators.get("Selection");
      if (manipulator) manipulator.draw(editor, null as any);
    }
    for (const shape of editor.store.shapes) {
      if (editor.selection.isSelected(shape)) {
        const manipulator = editor.manipulators.get(shape.type);
        if (manipulator) manipulator.draw(editor, shape);
      }
    }
  }
}

/**
 * Editor options
 */
export interface EditorOptions extends GraphicContextOptions {
  handlers: Handler[];
  defaultHandlerId: string;
  manipulators: Record<string, Manipulator>;
}

export interface DblClickEvent {
  shape: Shape | null;
  point: number[];
}

/**
 * The editor
 */
export class Editor {
  options!: EditorOptions;

  /**
   * The parent HTML element that holds the editor
   */
  parent: HTMLDivElement;

  /**
   * The canvas element for the editor
   */
  canvas!: HTMLCanvasElement;

  /**
   * The graphic context for the editor
   */
  gc!: GraphicContext;

  /**
   * The shape store.
   */
  store: Store;

  /**
   * The shape factory.
   */
  factory: ShapeFactory;

  /**
   * The clipboard for the editor
   */
  clipboard: Clipboard;

  /**
   * The handler manager for the editor
   */
  handlers: HandlerManager;

  /**
   * The manipulator manager for the editor
   */
  manipulators: ManipulatorManager;

  /**
   * The selection manager for the editor
   */
  selection: SelectionManager;

  /**
   * The transform manager for the editor
   */
  transform: Transform;

  /**
   * Indicates whether the editor is enabled or not. If disabled, the editor will not respond to user interactions.
   */
  enabled: boolean;

  /**
   * Event triggered when the editor state (size, scale, margin) changes.
   */
  onChange: TypedEvent<Editor>;

  /**
   * Event triggered when the editor is double-clicked.
   */
  onDblClick: TypedEvent<DblClickEvent>;

  constructor(editorHolder: HTMLDivElement, options: EditorOptions) {
    this.parent = editorHolder;
    this.options = options;
    this.handlers = new HandlerManager(
      this,
      this.options.handlers,
      this.options.defaultHandlerId,
    );
    this.manipulators = new ManipulatorManager(this.options.manipulators);
    this.selection = new SelectionManager(this);
    this.store = new Store();
    this.factory = new ShapeFactory();
    this.clipboard = new Clipboard();
    this.transform = new Transform(this.store);
    this.enabled = true;
    this.onChange = new TypedEvent<Editor>();
    this.onDblClick = new TypedEvent<DblClickEvent>();
    this.initializeCanvas();
    this.fit();
    this.repaint();
  }

  /**
   * Initialize the canvas element and set up event listeners
   */
  private initializeCanvas() {
    this.canvas = document.createElement("canvas");
    this.canvas.tabIndex = 0; // enable focus
    this.canvas.style.touchAction = "none"; // prevent pointer cancel event in mobile
    this.canvas.style.outline = "none"; // remove focus outline
    this.gc = new GraphicContext(this.canvas, {
      width: this.options.width,
      height: this.options.height,
      bpp: this.options.bpp,
      margin: this.options.margin,
      scale: this.options.scale,
    });
    this.parent.appendChild(this.canvas);

    const pointerDownHandler = (e: PointerEvent) => {
      if (this.enabled) {
        this.focus();
        const p = this.gc.toPixelCoord([e.offsetX, e.offsetY]);
        this.handlers.pointerDown(this, e, p);
      }
    };

    const pointerMoveHandler = (e: PointerEvent) => {
      if (this.enabled) {
        const p = this.gc.toPixelCoord([e.offsetX, e.offsetY]);
        this.handlers.pointerMove(this, e, p);
      }
    };

    const pointerUpHandler = (e: PointerEvent) => {
      if (this.enabled) {
        const p = this.gc.toPixelCoord([e.offsetX, e.offsetY]);
        this.handlers.pointerUp(this, e, p);
      }
    };

    const keyDownHandler = (e: KeyboardEvent) => {
      if (this.enabled) {
        if (this.handlers.activeHandler) {
          this.handlers.activeHandler.keyDown(this, e);
        }
      }
    };

    const dblClickHandler = (e: MouseEvent) => {
      if (this.enabled) {
        const point = this.gc.toPixelCoord([e.offsetX, e.offsetY]);
        const shape = this.getShapeAt(point);
        this.onDblClick.emit({ shape, point });
      }
    };

    // pointer event handlers
    this.canvas.addEventListener("pointerdown", pointerDownHandler);
    this.canvas.addEventListener("pointermove", pointerMoveHandler);
    this.canvas.addEventListener("pointerup", pointerUpHandler);
    this.canvas.addEventListener("keydown", keyDownHandler);
    this.canvas.addEventListener("dblclick", dblClickHandler);
    this.canvas.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
  }

  /**
   * Set focus on this editor
   */
  focus() {
    this.canvas.focus();
  }

  /**
   * Fit the canvas size to the graphic context size
   */
  fit() {
    const w = this.gc.width * this.gc.scale + this.gc.margin * 2;
    const h = this.gc.height * this.gc.scale + this.gc.margin * 2;
    this.canvas.width = Math.floor(w * this.gc.ratio);
    this.canvas.height = Math.floor(h * this.gc.ratio);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
  }

  /**
   * Set margin in pixels.
   */
  setMargin(margin: number) {
    this.gc.margin = margin;
    this.fit();
    this.repaint();
    this.onChange.emit(this);
  }

  /**
   * Set scene size in pixels.
   */
  setSize(width: number, height: number) {
    this.gc.setSize(width, height);
    this.fit();
    this.repaint();
    this.onChange.emit(this);
  }

  /**
   * Get scene size in pixels.
   */
  getSize(): number[] {
    return this.gc.getSize();
  }

  /**
   * Set scale factor.
   */
  setScale(scale: number) {
    this.gc.scale = scale;
    this.fit();
    this.repaint();
    this.onChange.emit(this);
  }

  /**
   * Get scale factor.
   */
  getScale(): number {
    return this.gc.scale;
  }

  /**
   * Get cursor
   */
  getCursor() {
    return this.canvas.style.cursor;
  }

  /**
   * Set cursor
   */
  setCursor(cursor: string, angle: number = 0) {
    const cssCursor = cursor.replace("{{angle}}", angle.toString());
    this.canvas.style.cursor = cssCursor;
  }

  /**
   * Load a font from a BDF string.
   */
  async loadFont(bdfstring: string) {
    return await loadFont(bdfstring);
  }

  /**
   * Get a list of available font names
   */
  getAvailableFonts(): string[] {
    return getAvailableFonts();
  }

  /**
   * Repaint the editor
   */
  repaint(drawSelection: boolean = true) {
    this.clearBackground();
    this.drawGrid();
    this.drawBorder();
    this.drawShapes();
    if (drawSelection) {
      this.selection.drawSelection(this);
    }
  }

  /**
   * Draw the background of the editor
   */
  clearBackground() {
    // this.gc.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.gc.clear();
  }

  /**
   * Draw the border of the editor
   */
  drawBorder() {
    this.gc.context.save();
    this.gc.context.scale(this.gc.ratio, this.gc.ratio);
    this.gc.context.strokeStyle = Color.BORDER;
    this.gc.context.lineWidth = 1;
    this.gc.context.strokeRect(
      this.gc.margin,
      this.gc.margin,
      this.gc.width * this.gc.scale,
      this.gc.height * this.gc.scale,
    );
    this.gc.context.restore();
  }

  /**
   * Draw the grid of the editor
   */
  drawGrid() {
    this.gc.context.save();
    this.gc.context.scale(this.gc.ratio, this.gc.ratio);
    this.gc.context.strokeStyle = Color.GRID;
    this.gc.context.lineWidth = 1;
    for (let x = 1; x < this.gc.width; x++) {
      const xPos = this.gc.margin + x * this.gc.scale;
      this.gc.context.beginPath();
      this.gc.context.moveTo(xPos, this.gc.margin);
      this.gc.context.lineTo(
        xPos,
        this.gc.margin + this.gc.height * this.gc.scale,
      );
      this.gc.context.stroke();
    }
    for (let y = 1; y < this.gc.height; y++) {
      const yPos = this.gc.margin + y * this.gc.scale;
      this.gc.context.beginPath();
      this.gc.context.moveTo(this.gc.margin, yPos);
      this.gc.context.lineTo(
        this.gc.margin + this.gc.width * this.gc.scale,
        yPos,
      );
      this.gc.context.stroke();
    }
    this.gc.context.restore();
  }

  /**
   * Render the scene shapes
   */
  drawShapes() {
    for (const shape of this.store.shapes) {
      render(this.gc, shape);
    }
    this.gc.renderBuffer();
  }

  /**
   * Get the shape at the given pixel coordinates.
   */
  getShapeAt(point: number[]): Shape | null {
    for (let i = this.store.shapes.length - 1; i >= 0; i--) {
      const shape = this.store.shapes[i];
      if (containsPoint(shape, point)) {
        return shape;
      }
    }
    return null;
  }

  /**
   * Undo the last action
   */
  undo() {
    this.transform.undo();
    this.repaint();
  }

  /**
   * Redo the last undone action
   */
  redo() {
    this.transform.redo();
    this.repaint();
  }

  /**
   * Update properties of shapes in the editor. If no shapes are provided, it will update the currently selected shapes.
   */
  updateProps(props: ShapeProps, shapes?: Shape[]) {
    const shapesToUpdate =
      shapes && shapes.length > 0 ? shapes : this.selection.get();
    this.transform.begin();
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
              this.transform.assign(shape, "path", ps);
            } else if (shape.type === ShapeType.PEN) {
              const s = shape as PenShape;
              const oldLeft = s.left;
              const dx = value - oldLeft;
              const ps = geometry.movePath(s.points, dx, 0);
              this.transform.assign(shape, "points", ps);
            }
          } else if (key === "top") {
            if (shape.type === ShapeType.LINE) {
              const s = shape as LineShape;
              const oldTop = s.top;
              const dy = value - oldTop;
              const ps = geometry.movePath(s.path, 0, dy);
              this.transform.assign(shape, "path", ps);
            } else if (shape.type === ShapeType.PEN) {
              const s = shape as PenShape;
              const oldTop = s.top;
              const dy = value - oldTop;
              const ps = geometry.movePath(s.points, 0, dy);
              this.transform.assign(shape, "points", ps);
            }
          }
          this.transform.assign(shape, key, value);
        }
      }
    }
    this.transform.end();
    this.repaint();
  }

  /**
   * Copy shapes to the clipboard. If no shapes are provided, it will copy the currently selected shapes.
   */
  async copy(shapes: Shape[] = []) {
    const shapesToCopy = shapes.length > 0 ? shapes : this.selection.get();
    await this.clipboard.write({ shapes: shapesToCopy });
  }

  /**
   * Cut shapes to the clipboard. If no shapes are provided, it will cut the currently selected shapes.
   */
  async cut(shapes: Shape[] = []) {
    const shapesToCut = shapes.length > 0 ? shapes : this.selection.get();
    await this.copy(shapesToCut);
    this.delete(shapesToCut);
  }

  /**
   * Paste shapes from the clipboard into the editor.
   */
  async paste() {
    const data = await this.clipboard.read();
    if (Array.isArray(data.shapes) && data.shapes.length > 0) {
      const newShapeIds: string[] = [];
      this.transform.begin();
      for (const shape of data.shapes) {
        shape.id = nanoid();
        move(shape, 4, 4);
        this.transform.insert(shape);
        newShapeIds.push(shape.id);
      }
      this.transform.end();
      const newShapes = newShapeIds
        .map((id) => this.store.getShapeById(id))
        .filter((shape): shape is Shape => shape !== undefined);
      this.selection.selectMultiple(newShapes, true);
      this.repaint();
    }
  }

  /**
   * Delete shapes from the editor. If no shapes are provided, it will delete the currently selected shapes.
   */
  delete(shapes: Shape[] = []) {
    const shapesToDelete = shapes.length > 0 ? shapes : this.selection.get();
    this.transform.begin();
    for (const shape of shapesToDelete) {
      this.selection.deselect(shape);
      this.transform.delete(shape);
    }
    this.transform.end();
    this.repaint();
  }

  /**
   * Duplicate shapes in the editor. If no shapes are provided, it will duplicate the currently selected shapes.
   */
  duplicate(shapes: Shape[] = []) {
    const shapesToDuplicate = shapes.length > 0 ? shapes : this.selection.get();
    const newShapeIds: string[] = [];
    this.transform.begin();
    for (const shape of shapesToDuplicate) {
      const newShape = structuredClone(shape) as Shape;
      newShape.id = nanoid();
      move(newShape, 4, 4);
      this.transform.insert(newShape);
      newShapeIds.push(newShape.id);
    }
    this.transform.end();
    const newShapes = newShapeIds
      .map((id) => this.store.getShapeById(id))
      .filter((shape): shape is Shape => shape !== undefined);
    this.selection.selectMultiple(newShapes, true);
    this.repaint();
  }

  /**
   * Bring shapes to the front.
   */
  bringToFront(shapes: Shape[] = []) {
    const shapesToBring = shapes.length > 0 ? shapes : this.selection.get();
    this.transform.begin();
    for (const shape of shapesToBring) {
      this.transform.reorder(shape, this.store.shapes.length - 1);
    }
    this.transform.end();
    this.repaint();
  }

  /**
   * Send shapes to the back.
   */
  sendToBack(shapes: Shape[] = []) {
    const shapesToSend = shapes.length > 0 ? shapes : this.selection.get();
    this.transform.begin();
    for (const shape of shapesToSend) {
      this.transform.reorder(shape, 0);
    }
    this.transform.end();
    this.repaint();
  }

  /**
   * Load the editor state from a JSON string.
   */
  loadFromJSON(json: any) {
    const width = json.width ?? this.gc.width;
    const height = json.height ?? this.gc.height;
    const scale = json.scale ?? this.gc.scale;
    const bpp = json.bpp ?? this.gc.bpp;
    this.setSize(width, height);
    this.setScale(scale);
    this.gc.bpp = bpp;
    this.store.fromJSON(json.shapes);
    this.repaint();
  }

  /**
   * Save the current state to a JSON string.
   */
  saveToJSON() {
    return {
      width: this.gc.width,
      height: this.gc.height,
      bpp: this.gc.bpp,
      scale: this.gc.scale,
      shapes: this.store.toJSON(),
    };
  }
}
