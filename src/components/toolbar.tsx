import { useEditorStore } from "@/store/editor-store";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";
import { NumberField } from "./ui/number-field";

const items = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export function Toolbar() {
  const activeHandler = useEditorStore((state) => state.activeHandler);
  const width = useEditorStore((state) => state.width);
  const height = useEditorStore((state) => state.height);

  return (
    <div className="w-full flex flex-col justify-start mt-4">
      <div className="text-xl flex flex-row items-start justify-center gap-2 py-1">
        <div className="flex gap-2">
          <Label className="text-sm" htmlFor="input-width">
            W
          </Label>
          <NumberField
            id="input-width"
            className="text-sm w-12"
            type="number"
            value={width}
            onChange={(value) => {
              window.app.editor.setSize(value, height);
            }}
          />
        </div>
        <div className="flex gap-2">
          <Label className="text-sm" htmlFor="input-height">
            H
          </Label>
          <NumberField
            id="input-height"
            className="text-sm w-12"
            type="number"
            value={height}
            onChange={(value) => {
              window.app.editor.setSize(width, value);
            }}
          />
        </div>

        <Button
          variant="outline"
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
          variant="outline"
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
        <Select items={items}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="text-xl flex flex-row items-start justify-center gap-1 py-1">
        <Button
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
          variant={activeHandler === "Bitmap" ? "default" : "outline"}
          size="icon-xs"
          className="size-7"
          onClick={() => {
            window.app.editor.handlers.setActiveHandler("Bitmap");
          }}
        >
          <BitmapIcon size={12} />
        </Button>
      </div>

      <div className="text-xl flex flex-row items-center justify-center gap-1 py-1">
        <Button
          variant="outline"
          size="icon-xs"
          className="size-7"
          onClick={() => {
            const scale = window.app.editor.getScale();
            if (scale < 16) window.app.editor.setScale(scale + 1);
          }}
        >
          <PlusIcon size={12} />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          className="size-7"
          onClick={() => {
            const scale = window.app.editor.getScale();
            if (scale > 1) window.app.editor.setScale(scale - 1);
          }}
        >
          <MinusIcon size={12} />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          className="size-7"
          onClick={() => {
            window.app.editor.undo();
          }}
        >
          <UndoIcon size={12} />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          className="size-7"
          onClick={() => {
            window.app.editor.redo();
          }}
        >
          <RedoIcon size={12} />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          className="size-7"
          onClick={() => {
            window.app.editor.delete();
          }}
        >
          <DeleteIcon size={12} />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          className="size-7"
          onClick={() => {
            window.app.editor.duplicate();
          }}
        >
          <DuplicateIcon size={12} />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          className="size-7"
          onClick={() => {
            window.app.editor.bringToFront();
          }}
        >
          <BringToFrontIcon size={12} />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          className="size-7"
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
