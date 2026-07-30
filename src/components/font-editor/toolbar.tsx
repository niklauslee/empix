import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { MinusIcon, PlusIcon, RedoIcon, UndoIcon } from "../icons";
import { findGlyph } from "./bdf";
import {
  clear,
  flipHorizontal,
  flipVertical,
  invert,
  shift,
  type Tool,
} from "./draw";
import { useFontStore } from "./font-store";

const TOOLS: { id: Tool; label: string; key: string }[] = [
  { id: "pen", label: "Pen", key: "P" },
  { id: "eraser", label: "Eraser", key: "E" },
  { id: "line", label: "Line", key: "L" },
  { id: "rect", label: "Rect", key: "R" },
  { id: "rect-fill", label: "Rect ■", key: "Shift+R" },
  { id: "fill", label: "Fill", key: "F" },
];

const SHIFTS: { label: string; dcol: number; drow: number }[] = [
  { label: "↑", dcol: 0, drow: -1 },
  { label: "↓", dcol: 0, drow: 1 },
  { label: "←", dcol: -1, drow: 0 },
  { label: "→", dcol: 1, drow: 0 },
];

export function Toolbar() {
  const font = useFontStore((state) => state.font);
  const code = useFontStore((state) => state.code);
  const tool = useFontStore((state) => state.tool);
  const cellSize = useFontStore((state) => state.cellSize);
  const showGuides = useFontStore((state) => state.showGuides);
  const setTool = useFontStore((state) => state.setTool);
  const setCellSize = useFontStore((state) => state.setCellSize);
  const setShowGuides = useFontStore((state) => state.setShowGuides);
  const commitPixels = useFontStore((state) => state.commitPixels);
  const undo = useFontStore((state) => state.undo);
  const redo = useFontStore((state) => state.redo);
  const canUndo = useFontStore((state) => state.undoStack.length > 0);
  const canRedo = useFontStore((state) => state.redoStack.length > 0);

  const glyph = findGlyph(font, code);
  const disabled = glyph === null;

  const apply = (transform: (pixels: boolean[]) => boolean[]) => {
    if (!glyph) return;
    commitPixels(transform(glyph.pixels));
  };

  return (
    <div className="flex w-full shrink-0 flex-col">
      {/* first row: tools, view controls */}
      <div className="flex min-h-10 w-full flex-wrap items-center gap-3 px-4 pt-2">
        <div className="flex items-center gap-1">
          {TOOLS.map((item) => (
            <Button
              key={item.id}
              size="sm"
              title={`${item.label} ⎯ ${item.key}`}
              variant={tool === item.id ? "default" : "outline"}
              onClick={() => setTool(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="outline"
            title="Zoom In"
            onClick={() => setCellSize(cellSize + 2)}
          >
            <PlusIcon size={12} />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            title="Zoom Out"
            onClick={() => setCellSize(cellSize - 2)}
          >
            <MinusIcon size={12} />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            title="Undo ⎯ Mod+Z"
            disabled={!canUndo}
            onClick={undo}
          >
            <UndoIcon size={12} />
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            title="Redo ⎯ Mod+Shift+Z"
            disabled={!canRedo}
            onClick={redo}
          >
            <RedoIcon size={12} />
          </Button>
        </div>
      </div>

      {/* second row: glyph operations, guides */}
      <div className="flex min-h-10 w-full flex-wrap items-center gap-3 px-4 pb-2">
        <div className="flex items-center gap-1">
          {SHIFTS.map((item) => (
            <Button
              key={item.label}
              size="icon-sm"
              variant="outline"
              title="Shift the glyph"
              disabled={disabled}
              onClick={() =>
                apply((pixels) => shift(font.box, pixels, item.dcol, item.drow))
              }
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="h-6 w-px bg-neutral-700" />
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            title="Invert ⎯ I"
            disabled={disabled}
            onClick={() => apply(invert)}
          >
            Invert
          </Button>
          <Button
            size="sm"
            variant="outline"
            title="Flip horizontally ⎯ Shift+H"
            disabled={disabled}
            onClick={() => apply((pixels) => flipHorizontal(font.box, pixels))}
          >
            Flip H
          </Button>
          <Button
            size="sm"
            variant="outline"
            title="Flip vertically ⎯ Shift+V"
            disabled={disabled}
            onClick={() => apply((pixels) => flipVertical(font.box, pixels))}
          >
            Flip V
          </Button>
          <Button
            size="sm"
            variant="outline"
            title="Clear the glyph ⎯ Delete"
            disabled={disabled}
            onClick={() => apply(() => clear(font.box))}
          >
            Clear
          </Button>
        </div>
        <Label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={showGuides}
            onCheckedChange={(checked) => setShowGuides(checked)}
          />
          Guides
        </Label>
      </div>
    </div>
  );
}
