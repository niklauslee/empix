import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { NumberField } from "../ui/number-field";
import { ScrollArea } from "../ui/scroll-area";
import { TextField } from "../ui/text-field";
import { useConfirmDialog } from "../dialogs/confirm-dialog";
import { findGlyph, formatCode } from "./bdf";
import { useFontStore } from "./font-store";

const Row: React.FC<{ label: string; title?: string; children: React.ReactNode }> = ({
  label,
  title,
  children,
}) => (
  <div className="flex w-full items-center gap-2">
    <Label className="w-16 shrink-0 text-xs" title={title ?? label}>
      {label}
    </Label>
    {children}
  </div>
);

function FontProperties() {
  const font = useFontStore((state) => state.font);
  const updateFont = useFontStore((state) => state.updateFont);

  return (
    <div className="flex flex-col gap-2">
      <Row label="Name" title="BDF FONT name">
        <TextField
          className="h-7"
          value={font.name}
          onChange={(value) => updateFont({ name: value })}
        />
      </Row>
      <Row label="Size" title="Point size">
        <NumberField
          className="h-7"
          value={font.pointSize}
          onChange={(value) => updateFont({ pointSize: value })}
        />
      </Row>
      <Row label="Ascent" title="FONT_ASCENT — pixels above the baseline">
        <NumberField
          className="h-7"
          value={font.ascent}
          onChange={(value) => updateFont({ ascent: value })}
        />
      </Row>
      <Row label="Descent" title="FONT_DESCENT — pixels below the baseline">
        <NumberField
          className="h-7"
          value={font.descent}
          onChange={(value) => updateFont({ descent: value })}
        />
      </Row>
      <div className="mt-1 text-[10px] text-muted-foreground">
        Bounding box — resizing re-maps every glyph around the origin.
      </div>
      <div className="flex w-full gap-2">
        <Row label="W" title="Bounding box width">
          <NumberField
            className="h-7"
            value={font.box.w}
            onChange={(value) => updateFont({ box: { w: Math.max(1, value) } })}
          />
        </Row>
        <Row label="H" title="Bounding box height">
          <NumberField
            className="h-7"
            value={font.box.h}
            onChange={(value) => updateFont({ box: { h: Math.max(1, value) } })}
          />
        </Row>
      </div>
      <div className="flex w-full gap-2">
        <Row label="X off" title="Bounding box x offset">
          <NumberField
            className="h-7"
            value={font.box.ox}
            onChange={(value) => updateFont({ box: { ox: value } })}
          />
        </Row>
        <Row label="Y off" title="Bounding box y offset">
          <NumberField
            className="h-7"
            value={font.box.oy}
            onChange={(value) => updateFont({ box: { oy: value } })}
          />
        </Row>
      </div>
    </div>
  );
}

function GlyphProperties() {
  const font = useFontStore((state) => state.font);
  const code = useFontStore((state) => state.code);
  const updateGlyph = useFontStore((state) => state.updateGlyph);
  const removeGlyph = useFontStore((state) => state.removeGlyph);
  const glyph = findGlyph(font, code);

  if (!glyph) {
    return (
      <div className="text-xs text-muted-foreground/60">No glyph selected</div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Row label="Code" title="Codepoint">
        <div className="flex h-7 w-full items-center px-1 font-mono text-xs">
          {formatCode(glyph.code)}
          <span className="ml-2 text-muted-foreground">
            {String.fromCodePoint(glyph.code)}
          </span>
        </div>
      </Row>
      <Row label="Name" title="Glyph name (STARTCHAR)">
        <TextField
          className="h-7"
          value={glyph.name}
          onChange={(value) => updateGlyph(glyph.code, { name: value })}
        />
      </Row>
      <Row label="Advance" title="DWIDTH — advance width in pixels">
        <NumberField
          className="h-7"
          value={glyph.dwidth}
          onChange={(value) =>
            updateGlyph(glyph.code, { dwidth: Math.max(0, value) })
          }
        />
      </Row>
      <Button
        variant="outline"
        size="sm"
        className="mt-1"
        onClick={() => {
          useConfirmDialog
            .getState()
            .show(
              "Delete Glyph",
              `Delete ${formatCode(glyph.code)} from the font? This cannot be undone.`,
              () => removeGlyph(glyph.code),
            );
        }}
      >
        Delete Glyph
      </Button>
    </div>
  );
}

interface PropertiesPanelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PropertiesPanel({ className, ...others }: PropertiesPanelProps) {
  return (
    <div className={cn("absolute inset-0 flex flex-col", className)} {...others}>
      <div className="flex h-10 shrink-0 items-center px-4 text-sm">Font</div>
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col gap-3 px-4 pb-4">
            <FontProperties />
            <div className="mt-1 border-t-[1.5px] border-neutral-800 pt-3 text-sm">
              Glyph
            </div>
            <GlyphProperties />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
