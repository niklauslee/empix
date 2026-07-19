import type { Editor } from "@/components/editor/editor";
import { detectPlatform, generateNewName } from "./lib/utils";
import { CommandManager } from "./engine/command-manager";
import { KeymapManager } from "./engine/keymap-manager";
import { registerCommands } from "./commands";
import keymapJson from "./keymap.json";
import { useEditorStore } from "./store/editor-store";
import { ShapeType } from "./components/editor/shapes";
import { Cursor } from "./components/editor/consts";

declare global {
  interface Window {
    app: AppContext;
  }
}

/**
 * Application context
 */
export class AppContext {
  /** Singleton instance of the app context */
  static instance: AppContext | null = null;

  /**
   * platform: "darwin" | "win32" | "linux" | "unknown"
   */
  platform: string;

  /**
   * Editor instance
   */
  editor!: Editor;

  /**
   * Command manager instance
   */
  commands: CommandManager;

  /**
   * Keymap manager instance
   */
  keymap: KeymapManager;

  /**
   * Returns a singleton app context instance
   */
  static getInstance(): AppContext {
    if (!AppContext.instance) {
      AppContext.instance = new AppContext();
    }
    return AppContext.instance;
  }

  constructor() {
    this.platform = detectPlatform();
    this.commands = new CommandManager();
    this.keymap = new KeymapManager({
      platform: this.platform,
      commandManager: this.commands,
    });
  }

  /**
   * Initializes the app context
   */
  initialize(editor: Editor) {
    this.editor = editor;
    this.wiring();
    this.loadKeymap();
    this.loadData();
    registerCommands();
  }

  /**
   * Wiring up events and listeners
   */
  wiring() {
    this.editor.onChange.addListener((editor) => {
      const size = editor.getSize();
      useEditorStore.getState().setSize(size[0], size[1]);
      useEditorStore.getState().setScale(editor.getScale());
      this.saveData();
    });
    this.editor.onDblClick.addListener(({ shape, point }) => {
      console.log("dblclick", shape, point);
      if (shape && shape.type === ShapeType.PEN) {
        this.editor.handlers.setActiveHandler("Pen");
        (this.editor.handlers.activeHandler as any).shape = shape;
      }
    });
    this.editor.factory.onCreate.addListener((shape) => {
      shape.name = generateNewName(
        shape.type,
        this.editor.store.shapes.map((s) => s.name),
      );
    });
    this.editor.transform.onAction.addListener((action) => {
      useEditorStore.getState().increaseActionSequence();
      useEditorStore.getState().setShapes([...this.editor.store.shapes]);
      this.saveData();
    });
    this.editor.transform.onUndo.addListener((shape) => {
      useEditorStore.getState().increaseActionSequence();
      useEditorStore.getState().setShapes([...this.editor.store.shapes]);
      this.saveData();
    });
    this.editor.transform.onRedo.addListener((shape) => {
      useEditorStore.getState().increaseActionSequence();
      useEditorStore.getState().setShapes([...this.editor.store.shapes]);
      this.saveData();
    });
    this.editor.selection.onChange.addListener((shapes) => {
      useEditorStore.getState().setSelection([...shapes]);
    });
    this.editor.handlers.onActiveHandlerChange.addListener((handlerId) => {
      useEditorStore.getState().setActiveHandler(handlerId);
    });
  }

  loadKeymap() {
    try {
      this.keymap.add(keymapJson);
      this.keymap.htmlReady();
    } catch (err) {
      console.error("Failed to load keymaps", err);
    }
  }

  loadData() {
    const data = localStorage.getItem("app-data");
    if (data) {
      try {
        const json = JSON.parse(data);
        this.editor.loadFromJSON(json);
      } catch (err) {
        console.error("Failed to load app data", err);
      }
    }
    useEditorStore
      .getState()
      .setSize(this.editor.getSize()[0], this.editor.getSize()[1]);
    useEditorStore.getState().setScale(this.editor.getScale());
    useEditorStore
      .getState()
      .setActiveHandler(this.editor.handlers.defaultHandlerId);
    useEditorStore.getState().setShapes([...this.editor.store.shapes]);
  }

  saveData() {
    const json = this.editor.saveToJSON();
    localStorage.setItem("app-data", JSON.stringify(json));
  }
}

/**
 * Global app context instance
 */
export const app = AppContext.getInstance();

/**
 * Assign the app context to the global window object
 */
window.app = app;
