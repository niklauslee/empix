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
import { Button } from "./ui/button";

export function Toolbar() {
  return (
    <div className="w-full flex flex-col justify-start mt-4">
      <div className="text-xl flex flex-row items-start justify-center gap-2 py-1">
        <Button
          variant="primary"
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
              window.app.editor.loadFromJSON(JSON.parse(text));
            } catch (e) {
              if ((e as any)?.name !== "AbortError") console.error(e);
            }
          }}
        >
          Import
        </Button>
        <Button
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
                JSON.stringify(window.app.editor.saveToJSON(), null, 2),
              );
              await writable.close();
            } catch (e) {
              if ((e as any)?.name !== "AbortError") console.error(e);
            }
          }}
        >
          Export
        </Button>
      </div>
      <div className="text-xl flex flex-row items-start justify-center gap-1 py-1">
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.handlers.setActiveHandler("Select");
          }}
        >
          <CursorIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.handlers.setActiveHandler("Rectangle");
          }}
        >
          <RectangleIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.handlers.setActiveHandler("Ellipse");
          }}
        >
          <EllipseIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.handlers.setActiveHandler("Line");
          }}
        >
          <LineIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.handlers.setActiveHandler("Text");
          }}
        >
          <TextIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.handlers.setActiveHandler("Bitmap");
          }}
        >
          <BitmapIcon size={12} />
        </Button>
      </div>

      <div className="text-xl flex flex-row items-center justify-center gap-1 py-1">
        <Button
          variant="icon"
          onClick={() => {
            const scale = window.app.editor.getScale();
            if (scale < 16) window.app.editor.setScale(scale + 1);
          }}
        >
          <PlusIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            const scale = window.app.editor.getScale();
            if (scale > 1) window.app.editor.setScale(scale - 1);
          }}
        >
          <MinusIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.undo();
          }}
        >
          <UndoIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.redo();
          }}
        >
          <RedoIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.delete();
          }}
        >
          <DeleteIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.duplicate();
          }}
        >
          <DuplicateIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.bringToFront();
          }}
        >
          <BringToFrontIcon size={12} />
        </Button>
        <Button
          variant="icon"
          onClick={() => {
            window.app.editor.sendToBack();
          }}
        >
          <SendToBackIcon size={12} />
        </Button>
      </div>
    </div>
  );
}
