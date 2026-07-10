import { Editor } from "./editor/editor";
import { EditorComponent } from "./editor/editor-component";

declare global {
  interface Window {
    editor: Editor;
  }
}

function App() {
  const handleMount = (editor: Editor) => {
    window.editor = editor;
    editor.fit();
    editor.repaint();
  };

  return (
    <main>
      <h1 className="text-4xl font-bold text-green-500 text-center py-5">
        Empix Studio
      </h1>
      <div className="flex flex-row items-center justify-center gap-2 py-2">
        <button
          className="text-xs px-2 py-1 border border-black bg-slate-200"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Select");
          }}
        >
          Select
        </button>
        <button
          className="text-xs px-2 py-1 border border-black bg-slate-200"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Rectangle");
          }}
        >
          Rectangle
        </button>
        <button
          className="text-xs px-2 py-1 border border-black bg-slate-200"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Ellipse");
          }}
        >
          Ellipse
        </button>
        <button
          className="text-xs px-2 py-1 border border-black bg-slate-200"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Line");
          }}
        >
          Line
        </button>
      </div>
      <div className="flex flex-row items-center justify-center gap-2 py-2">
        <button
          className="text-xs px-2 py-1 border border-black"
          onClick={() => {
            const scale = window.editor.getScale();
            if (scale < 16) window.editor.setScale(scale + 1);
          }}
        >
          +
        </button>
        <button
          className="text-xs px-2 py-1 border border-black"
          onClick={() => {
            const scale = window.editor.getScale();
            if (scale > 1) window.editor.setScale(scale - 1);
          }}
        >
          -
        </button>
        <button
          className="text-xs px-2 py-1 border border-black"
          onClick={() => {
            window.editor.undo();
          }}
        >
          Undo
        </button>
        <button
          className="text-xs px-2 py-1 border border-black"
          onClick={() => {
            window.editor.redo();
          }}
        >
          Redo
        </button>
        <button
          className="text-xs px-2 py-1 border border-black"
          onClick={() => {
            window.editor.delete();
          }}
        >
          Delete
        </button>
        <button
          className="text-xs px-2 py-1 border border-black"
          onClick={() => {
            window.editor.bringToFront();
          }}
        >
          Bring to Front
        </button>
        <button
          className="text-xs px-2 py-1 border border-black"
          onClick={() => {
            window.editor.sendToBack();
          }}
        >
          Send to Back
        </button>
      </div>
      <div className="flex flex-col items-center justify-center w-full h-full mt-4">
        <EditorComponent onMount={handleMount} />
      </div>
    </main>
  );
}

export default App;
