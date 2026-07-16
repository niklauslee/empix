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
    <main className="bg-black text-white w-screen h-screen flex flex-col justify-start">
      <h1 className="text-5xl font-bold text-green-600 text-center py-2">
        Empix Studio
      </h1>

      <div className="text-xl flex flex-row items-start justify-center gap-2 py-1">
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Select");
          }}
        >
          Select
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Rectangle");
          }}
        >
          Rectangle
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Ellipse");
          }}
        >
          Ellipse
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Line");
          }}
        >
          Line
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Text");
          }}
        >
          Text
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Bitmap");
          }}
        >
          Bitmap
        </button>
      </div>

      <div className="text-xl flex flex-row items-center justify-center gap-2 py-1">
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            const scale = window.editor.getScale();
            if (scale < 16) window.editor.setScale(scale + 1);
          }}
        >
          +
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            const scale = window.editor.getScale();
            if (scale > 1) window.editor.setScale(scale - 1);
          }}
        >
          -
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.undo();
          }}
        >
          Undo
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.redo();
          }}
        >
          Redo
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.delete();
          }}
        >
          Delete
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.bringToFront();
          }}
        >
          Bring to Front
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={() => {
            window.editor.sendToBack();
          }}
        >
          Send to Back
        </button>
      </div>

      <div className="flex flex-col items-center justify-start w-full h-full mt-0">
        <EditorComponent onMount={handleMount} />
      </div>
    </main>
  );
}

export default App;
