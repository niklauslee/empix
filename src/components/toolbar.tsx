import { useEditorStore } from "@/store/editor-store";
import {
  BringToFrontIcon,
  CursorIcon,
  DeleteIcon,
  DuplicateIcon,
  EllipseIcon,
  LineIcon,
  MinusIcon,
  PenIcon,
  PlusIcon,
  RectangleIcon,
  RedoIcon,
  SendToBackIcon,
  TextIcon,
  UndoIcon,
} from "./icons";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { NumberField } from "./ui/number-field";
import { useConfirmDialog } from "./dialogs/confirm-dialog";
import { useCodeDialog } from "./dialogs/code-dialog";
import { useKeymapStore } from "@/store/keymap-store";

export function Toolbar() {
  const activeHandler = useEditorStore((state) => state.activeHandler);
  const width = useEditorStore((state) => state.width);
  const height = useEditorStore((state) => state.height);
  const formattedKeys = useKeymapStore((state) => state.formattedKeys);

  return (
    <div className="w-full flex flex-col justify-start mt-4">
      <div className="text-xl w-full flex flex-row items-start justify-between gap-2 py-1">
        <div className="flex flex-row items-center justify-start gap-2 px-4">
          <div className="flex gap-2">
            <Label
              className="text-sm"
              htmlFor="input-editor-width"
              title="Editor Width"
            >
              W
            </Label>
            <NumberField
              id="input-editor-width"
              title="Editor Width"
              className="text-sm w-12"
              type="number"
              value={width}
              onChange={(value) => {
                window.app.editor.setSize(value, height);
              }}
            />
          </div>
          <div className="flex gap-2">
            <Label
              className="text-sm"
              htmlFor="input-editor-height"
              title="Editor Height"
            >
              H
            </Label>
            <NumberField
              id="input-editor-height"
              className="text-sm w-12"
              title="Editor Height"
              type="number"
              value={height}
              onChange={(value) => {
                window.app.editor.setSize(width, value);
              }}
            />
          </div>
        </div>
        <div className="flex flex-row items-center justify-end gap-2 px-4">
          <Button
            variant="outline"
            onClick={() => {
              useConfirmDialog
                .getState()
                .show(
                  "Clear Canvas",
                  "Are you sure you want to clear the canvas? This action cannot be undone.",
                  () => {
                    window.app.editor.clear();
                  },
                );
            }}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              useCodeDialog.getState().setOpen(true);
            }}
          >
            Code
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              // FIXME: Only works in Chromium-based browsers
              try {
                const [fileHandle] = await (window as any).showOpenFilePicker({
                  types: [
                    {
                      description: "Empix file",
                      accept: { "application/json": [".empix"] },
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
            variant="outline"
            onClick={async () => {
              // FIXME: Only works in Chromium-based browsers
              try {
                const fileHandle = await (window as any).showSaveFilePicker({
                  suggestedName: "untitled.empix",
                  types: [
                    {
                      description: "Empix file",
                      accept: { "application/json": [".empix"] },
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
      </div>

      <div className="w-full flex flex-row items-start justify-between px-4 py-3">
        <div className="text-xl flex flex-row items-start justify-center gap-1">
          <Button
            title={`Select ⎯ ${formattedKeys["tool:select"]}`}
            variant={activeHandler === "Select" ? "default" : "outline"}
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Select");
            }}
          >
            <CursorIcon size={12} />
          </Button>
          <Button
            title={`Rectangle ⎯ ${formattedKeys["tool:rectangle"]}`}
            variant={activeHandler === "Rectangle" ? "default" : "outline"}
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Rectangle");
            }}
          >
            <RectangleIcon size={12} />
          </Button>
          <Button
            title={`Ellipse ⎯ ${formattedKeys["tool:ellipse"]}`}
            variant={activeHandler === "Ellipse" ? "default" : "outline"}
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Ellipse");
            }}
          >
            <EllipseIcon size={12} />
          </Button>
          <Button
            title={`Line ⎯ ${formattedKeys["tool:line"]}`}
            variant={activeHandler === "Line" ? "default" : "outline"}
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Line");
            }}
          >
            <LineIcon size={12} />
          </Button>
          <Button
            title={`Text ⎯ ${formattedKeys["tool:text"]}`}
            variant={activeHandler === "Text" ? "default" : "outline"}
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Text");
            }}
          >
            <TextIcon size={12} />
          </Button>
          <Button
            title={`Pen ⎯ ${formattedKeys["tool:pen"]}`}
            variant={activeHandler === "Pen" ? "default" : "outline"}
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Pen");
            }}
          >
            <PenIcon size={12} />
          </Button>
          {/* <Button
          variant={activeHandler === "Bitmap" ? "default" : "outline"}
          size="icon-xs"
          className="size-7"
          onClick={() => {
            window.app.editor.handlers.setActiveHandler("Bitmap");
          }}
        >
          <BitmapIcon size={12} />
        </Button> */}
        </div>
        <div className="text-xl flex flex-row items-center justify-center gap-1">
          <Button
            title={`Zoom In ⎯ ${formattedKeys["view:zoom-in"]}`}
            variant="outline"
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.commands.execute("view:zoom-in");
            }}
          >
            <PlusIcon size={12} />
          </Button>
          <Button
            title={`Zoom Out ⎯ ${formattedKeys["view:zoom-out"]}`}
            variant="outline"
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.commands.execute("view:zoom-out");
            }}
          >
            <MinusIcon size={12} />
          </Button>
          <Button
            title={`Undo ⎯ ${formattedKeys["edit:undo"]}`}
            variant="outline"
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.actions.undo();
            }}
          >
            <UndoIcon size={12} />
          </Button>
          <Button
            title={`Redo ⎯ ${formattedKeys["edit:redo"]}`}
            variant="outline"
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.actions.redo();
            }}
          >
            <RedoIcon size={12} />
          </Button>
          <Button
            title={`Delete ⎯ ${formattedKeys["edit:delete"]}`}
            variant="outline"
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.actions.delete();
            }}
          >
            <DeleteIcon size={12} />
          </Button>
          <Button
            title={`Duplicate ⎯ ${formattedKeys["edit:duplicate"]}`}
            variant="outline"
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.actions.duplicate();
            }}
          >
            <DuplicateIcon size={12} />
          </Button>
          <Button
            title={`Bring to Front ⎯ ${formattedKeys["align:bring-to-front"]}`}
            variant="outline"
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.actions.bringToFront();
            }}
          >
            <BringToFrontIcon size={12} />
          </Button>
          <Button
            title={`Send to Back ⎯ ${formattedKeys["align:send-to-back"]}`}
            variant="outline"
            size="icon-xs"
            className="size-7"
            onClick={() => {
              window.app.editor.actions.sendToBack();
            }}
          >
            <SendToBackIcon size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}
