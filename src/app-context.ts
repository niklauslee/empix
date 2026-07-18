import type { Editor } from "@/components/editor/editor";
import { ProjectManager } from "./project-manager";
import { detectPlatform } from "./lib/utils";
import { CommandManager } from "./engine/command-manager";
import { KeymapManager } from "./engine/keymap-manager";
import { registerCommands } from "./commands";
import keymapJson from "./keymap.json";

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
   * Project manager instance
   */
  projectManager: ProjectManager;

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
    this.projectManager = new ProjectManager();
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
    this.loadKeymap();
    registerCommands();
  }

  loadKeymap() {
    try {
      this.keymap.add(keymapJson);
      this.keymap.htmlReady();
      // useKeymapStore
      //   .getState()
      //   .setFormattedKeys(this.keymaps.getAllFormattedKeyByCommand());
    } catch (err) {
      console.error("Failed to load keymaps", err);
    }
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
