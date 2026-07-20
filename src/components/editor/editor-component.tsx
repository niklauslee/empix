import { useEffect, useRef } from "react";
import { Editor, type EditorOptions } from "./editor";
import {
  BitmapFactoryHandler,
  EllipseFactoryHandler,
  LineFactoryHandler,
  PenFactoryHandler,
  RectangleFactoryHandler,
  SelectHandler,
  TextFactoryHandler,
} from "./handlers";
import {
  BitmapManipulator,
  BoxManipulator,
  LineManipulator,
  PenManipulator,
  SelectionManipulator,
  TextManipulator,
} from "./manipulators";
import { cn } from "@/lib/utils";

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
      new EllipseFactoryHandler("Ellipse"),
      new LineFactoryHandler("Line"),
      new TextFactoryHandler("Text"),
      new BitmapFactoryHandler("Bitmap"),
      new PenFactoryHandler("Pen"),
    ],
    defaultHandlerId: "Select",
    manipulators: {
      Selection: new SelectionManipulator(),
      Rectangle: new BoxManipulator(),
      Ellipse: new BoxManipulator(),
      Line: new LineManipulator(),
      Text: new TextManipulator(),
      Bitmap: new BitmapManipulator(),
      Pen: new PenManipulator(),
    },
    width: 128,
    height: 64,
    bpp: 1,
    margin: 32,
    scale: 4,
  };
}

/**
 * React component that wraps the editor.
 */
export const EditorComponent: React.FC<EditorComponentProps> = ({
  className,
  onMount,
  ...others
}) => {
  const editorHolderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new Editor(editorHolderRef.current!, basicSetup());
      editorRef.current = editor;
      if (editor.handlers.defaultHandlerId) {
        editor.handlers.setActiveHandler(editor.handlers.defaultHandlerId);
      }
      editor.fit();
      editor.repaint();
      (window as any).editor = editor; // for debugging
      if (onMount) onMount(editor);
    }
    return () => {};
  }, []);

  return <div ref={editorHolderRef} {...others} />;
};
