import type { Editor } from "@/components/editor/editor";

/**
 * Code generator class
 */
export class CodeGenerator {
  editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  generate(editor: Editor): string {
    return `import { createApp } from "empix";

const app = createApp({
  container: document.getElementById("app")!,
  width: 800,
  height: 600,
});`;
  }
}
