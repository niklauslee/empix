import { useEffect, useRef } from "react";
import { Editor, type EditorOptions } from "./editor";
import { RectangleFactoryHandler, SelectHandler } from "./handlers";
import { BoxManipulator, SelectionManipulator } from "./manipulators";

export interface EditorComponentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onScroll" | "onDragStart" | "onDrag" | "onDragEnd"
> {
  onMount?: (editor: Editor) => void;
}

function basicSetup(): EditorOptions {
  return {
    handlers: [
      new SelectHandler("Select"),
      new RectangleFactoryHandler("Rectangle"),
    ],
    defaultHandlerId: "Select",
    manipulators: {
      Selection: new SelectionManipulator(),
      Rectangle: new BoxManipulator(),
    },
    width: 64,
    height: 32,
    margin: 20,
    scale: 12,
  };
}

/**
 * React component that wraps the editor.
 */
export const EditorComponent: React.FC<EditorComponentProps> = ({
  onMount,
  ...others
}) => {
  const editorHolderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new Editor(editorHolderRef.current!, basicSetup());
      editorRef.current = editor;
      editor.fit();
      editor.repaint();
      (window as any).editor = editor; // for debugging
      if (onMount) onMount(editor);
    }
    return () => {}; // TODO: dispose (remove listeners)
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 border h-fit w-fit p-8"
      ref={editorHolderRef}
      {...others}
    />
  );
};
