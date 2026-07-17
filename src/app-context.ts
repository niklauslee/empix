import type { Editor } from "@/components/editor/editor";
import { ProjectManager } from "./project-manager";
import { detectPlatform } from "./lib/utils";

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
  }

  /**
   * Sets the editor instance
   */
  setEditor(editor: Editor) {
    this.editor = editor;
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
