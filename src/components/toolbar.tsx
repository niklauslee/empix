import {
  BitmapIcon,
  BringToFrontIcon,
  CursorIcon,
  DeleteIcon,
  DuplicateIcon,
  EllipseIcon,
  LineIcon,
  MinusIcon,
  PlusIcon,
  RectangleIcon,
  RedoIcon,
  SendToBackIcon,
  TextIcon,
  UndoIcon,
} from "./icons";

export function Toolbar() {
  return (
    <div className="bg-black text-white w-full flex flex-col justify-start mt-4">
      <div className="text-xl flex flex-row items-start justify-center gap-2 py-1">
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={async () => {
            // FIXME: Only works in Chromium-based browsers
            try {
              const [fileHandle] = await (window as any).showOpenFilePicker({
                types: [
                  {
                    description: "JSON file",
                    accept: { "application/json": [".json"] },
                  },
                ],
                multiple: false,
              });
              const file = await fileHandle.getFile();
              const text = await file.text();
              window.editor.loadFromJSON(JSON.parse(text));
            } catch (e) {
              if ((e as any)?.name !== "AbortError") console.error(e);
            }
          }}
        >
          Import
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white"
          onClick={async () => {
            // FIXME: Only works in Chromium-based browsers
            try {
              const fileHandle = await (window as any).showSaveFilePicker({
                suggestedName: "untitled.json",
                types: [
                  {
                    description: "JSON file",
                    accept: { "application/json": [".json"] },
                  },
                ],
              });
              const writable = await fileHandle.createWritable();
              await writable.write(
                JSON.stringify(window.editor.saveToJSON(), null, 2),
              );
              await writable.close();
            } catch (e) {
              if ((e as any)?.name !== "AbortError") console.error(e);
            }
          }}
        >
          Export
        </button>
      </div>
      <div className="text-xl flex flex-row items-start justify-center gap-2 py-1">
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Select");
          }}
        >
          <CursorIcon size={12} />
          Select
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Rectangle");
          }}
        >
          <RectangleIcon size={12} />
          Rectangle
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Ellipse");
          }}
        >
          <EllipseIcon size={12} />
          Ellipse
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Line");
          }}
        >
          <LineIcon size={12} />
          Line
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Text");
          }}
        >
          <TextIcon size={12} />
          Text
        </button>
        <button
          className="px-2 py-0 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.handlers.setActiveHandler("Bitmap");
          }}
        >
          <BitmapIcon size={12} />
          Bitmap
        </button>
      </div>

      <div className="text-xl flex flex-row items-center justify-center gap-2 py-1">
        <button
          className="px-1 py-1 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            const scale = window.editor.getScale();
            if (scale < 16) window.editor.setScale(scale + 1);
          }}
        >
          <PlusIcon size={12} />
        </button>
        <button
          className="px-1 py-1 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            const scale = window.editor.getScale();
            if (scale > 1) window.editor.setScale(scale - 1);
          }}
        >
          <MinusIcon size={12} />
        </button>
        <button
          className="px-1 py-1 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.undo();
          }}
        >
          <UndoIcon size={12} />
        </button>
        <button
          className="px-1 py-1 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.redo();
          }}
        >
          <RedoIcon size={12} />
        </button>
        <button
          className="px-1 py-1 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.delete();
          }}
        >
          <DeleteIcon size={12} />
        </button>
        <button
          className="px-1 py-1 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.duplicate();
          }}
        >
          <DuplicateIcon size={12} />
        </button>
        <button
          className="px-1 py-1 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.bringToFront();
          }}
        >
          <BringToFrontIcon size={12} />
        </button>
        <button
          className="px-1 py-1 leading-6 border-[1.5px] border-white flex items-center gap-1"
          onClick={() => {
            window.editor.sendToBack();
          }}
        >
          <SendToBackIcon size={12} />
        </button>
      </div>
    </div>
  );
}
