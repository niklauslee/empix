import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { formatCode, type Font, type Glyph } from "./bdf";
import { useFontStore } from "./font-store";
import { drawGlyph, setupCanvas } from "./render";

/** Cap on rendered thumbnails — large fonts are reached through the search. */
const MAX_ITEMS = 512;
const THUMB_SIZE = 26;

/**
 * Parse a codepoint written as a character (`A`), hex (`U+41`, `0x41`) or a
 * decimal number (`65`).
 */
export function parseCodepoint(text: string): number | null {
  const value = text.trim();
  if (value.length === 0) return null;
  const hex = value.match(/^(?:U\+|u\+|0x|0X)([0-9a-fA-F]+)$/);
  if (hex) return parseInt(hex[1], 16);
  if (/^\d+$/.test(value)) return Number(value);
  const chars = [...value];
  if (chars.length === 1) return chars[0].codePointAt(0)!;
  return null;
}

/**
 * Short label identifying a codepoint: the character itself, or its hex code
 * when it has no printable form.
 */
function charLabel(code: number): string {
  if (code === 0x20) return "SP";
  if (code < 0x21 || (code >= 0x7f && code <= 0xa0)) {
    return code.toString(16).toUpperCase().padStart(2, "0");
  }
  return String.fromCodePoint(code);
}

function matches(glyph: Glyph, filter: string): boolean {
  const value = filter.trim();
  if (value.length === 0) return true;
  if (glyph.name.toLowerCase().includes(value.toLowerCase())) return true;
  if (formatCode(glyph.code).includes(value.toUpperCase())) return true;
  return parseCodepoint(value) === glyph.code;
}

function GlyphThumb({
  font,
  glyph,
  color,
}: {
  font: Font;
  glyph: Glyph;
  color: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { box } = font;
  const scale = Math.max(1, Math.floor(THUMB_SIZE / Math.max(box.w, box.h)));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, box.w * scale, box.h * scale);
    if (!ctx) return;
    ctx.fillStyle = color;
    drawGlyph(ctx, font, glyph, -box.ox * scale, (box.oy + box.h) * scale, scale);
  }, [font, glyph, scale, color, box.w, box.h, box.ox, box.oy]);

  return <canvas ref={canvasRef} />;
}

interface GlyphListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GlyphList({ className, ...others }: GlyphListProps) {
  const font = useFontStore((state) => state.font);
  const code = useFontStore((state) => state.code);
  const filter = useFontStore((state) => state.filter);
  const setFilter = useFontStore((state) => state.setFilter);
  const selectCode = useFontStore((state) => state.selectCode);
  const addGlyph = useFontStore((state) => state.addGlyph);

  const filtered = useMemo(
    () => font.glyphs.filter((glyph) => matches(glyph, filter)),
    [font.glyphs, filter],
  );
  const visible = filtered.slice(0, MAX_ITEMS);

  const handleAdd = () => {
    const value = parseCodepoint(filter);
    if (value === null || value < 0) return;
    addGlyph(value);
    setFilter("");
  };

  return (
    <div className={cn("absolute inset-0 flex flex-col", className)} {...others}>
      <div className="flex h-10 shrink-0 items-center justify-between px-4 text-sm">
        <div>Glyphs</div>
        <div className="text-xs text-muted-foreground">
          {font.glyphs.length}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 px-4 pb-2">
        <Input
          value={filter}
          placeholder="char or U+XXXX"
          className="h-7"
          onChange={(event) => setFilter(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              if (filtered.length === 1) selectCode(filtered[0].code);
              else handleAdd();
            }
          }}
        />
        <Button
          variant="outline"
          size="icon-sm"
          title="Add a glyph for the searched codepoint"
          disabled={parseCodepoint(filter) === null}
          onClick={handleAdd}
        >
          +
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full w-full">
          <div className="grid grid-cols-5 gap-px px-3 pb-3">
            {visible.map((glyph) => {
              const selected = glyph.code === code;
              return (
                <button
                  key={glyph.code}
                  title={`${formatCode(glyph.code)} ${glyph.name}`}
                  className={cn(
                    "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 border-[1.5px] border-neutral-800 hover:bg-neutral-800",
                    selected && "border-neutral-100 bg-neutral-100",
                  )}
                  onClick={() => selectCode(glyph.code)}
                >
                  <GlyphThumb
                    font={font}
                    glyph={glyph}
                    color={selected ? "#000000" : "#f5f5f5"}
                  />
                  <span
                    className={cn(
                      "font-mono text-[10px] leading-none",
                      selected ? "text-black/60" : "text-muted-foreground",
                    )}
                  >
                    {charLabel(glyph.code)}
                  </span>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="px-4 py-2 text-xs text-muted-foreground/60">
              No glyphs
            </div>
          )}
          {filtered.length > visible.length && (
            <div className="px-4 py-2 text-xs text-muted-foreground/60">
              {filtered.length - visible.length} more — refine the search
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
