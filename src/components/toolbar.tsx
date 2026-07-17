export function Toolbar() {
  return (
    <div className="bg-black text-white w-full flex flex-col justify-start">
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
    </div>
  );
}
