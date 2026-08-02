import { useEffect, useRef, useState } from "react";
import { Appbar } from "@/components/appbar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { FontCodeDialog, showFontCodeDialog } from "./code-dialog";
import {
  createFont,
  createGlyph,
  findGlyph,
  formatCode,
  parseBDF,
  remapPixels,
  serializeBDF,
  type Font,
  type Glyph,
} from "./bdf";
import {
  clear,
  flipHorizontal,
  flipVertical,
  invert,
  shift,
  type Tool,
} from "./draw";
import { loadDefaultGlyphSource, useFontStore } from "./font-store";
import { GlyphCanvas } from "./glyph-canvas";
import { GlyphList } from "./glyph-list";
import { PropertiesPanel } from "./properties";
import { Preview } from "./preview";
import { Toolbar } from "./toolbar";
import { codepointsForRanges } from "./charsets";
import { NewFontDialog, useNewFontDialog } from "./new-font-dialog";

/**
 * A fresh font for the given ranges (see charsets.ts). When `fillGlyphs` is
 * set, glyphs are pre-filled with shapes from the built-in default font
 * instead of being left blank.
 */
function blankFont(rangeIds: ReadonlySet<string>, fillGlyphs: boolean): Font {
  const font = createFont({
    name: "untitled",
    box: { w: 8, h: 13, ox: 0, oy: -2 },
    pointSize: 13,
    ascent: 11,
    descent: 2,
  });
  const source = fillGlyphs ? loadDefaultGlyphSource() : null;
  const glyphs: Glyph[] = codepointsForRanges(rangeIds).map((code) => {
    const glyph = createGlyph(font, code);
    const sourceGlyph = source && findGlyph(source, code);
    if (!sourceGlyph) return glyph;
    return {
      ...glyph,
      pixels: remapPixels(source.box, sourceGlyph.pixels, font.box),
    };
  });
  return { ...font, glyphs };
}

const TOOL_KEYS: Record<string, Tool> = {
  p: "pen",
  e: "eraser",
  l: "line",
  r: "rect",
  R: "rect-fill",
  f: "fill",
};

const SHIFT_KEYS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function App() {
  const font = useFontStore((state) => state.font);
  const code = useFontStore((state) => state.code);
  const tool = useFontStore((state) => state.tool);
  const hover = useFontStore((state) => state.hover);
  const setFont = useFontStore((state) => state.setFont);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const glyph = findGlyph(font, code);
  const onPixels = glyph?.pixels.filter((on) => on).length ?? 0;

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  };

  // keyboard shortcuts — bitmap operations act on the selected glyph
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const store = useFontStore.getState();
      const box = store.font.box;
      const current = findGlyph(store.font, store.code);
      const mod = event.metaKey || event.ctrlKey;

      if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (mod && (event.key === "=" || event.key === "+")) {
        event.preventDefault();
        store.setCellSize(store.cellSize + 2);
        return;
      }
      if (mod && event.key === "-") {
        event.preventDefault();
        store.setCellSize(store.cellSize - 2);
        return;
      }
      if (mod || event.altKey) return;

      const nextTool = TOOL_KEYS[event.key];
      if (nextTool) {
        store.setTool(nextTool);
        return;
      }

      const delta = SHIFT_KEYS[event.key];
      if (delta) {
        event.preventDefault();
        if (current) store.commitPixels(shift(box, current.pixels, ...delta));
        return;
      }

      switch (event.key) {
        case "[":
          store.selectAdjacent(-1);
          break;
        case "]":
          store.selectAdjacent(1);
          break;
        case "i":
          if (current) store.commitPixels(invert(current.pixels));
          break;
        case "H":
          if (current) store.commitPixels(flipHorizontal(box, current.pixels));
          break;
        case "V":
          if (current) store.commitPixels(flipVertical(box, current.pixels));
          break;
        case "Delete":
        case "Backspace":
          event.preventDefault();
          if (current) store.commitPixels(clear(box));
          break;
        case "+":
        case "=":
          store.setCellSize(store.cellSize + 2);
          break;
        case "-":
          store.setCellSize(store.cellSize - 2);
          break;
        case "g":
          store.setShowGuides(!store.showGuides);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleImport = async (file: File) => {
    try {
      const imported = parseBDF(await file.text());
      if (imported.glyphs.length === 0) throw new Error("no glyphs found");
      setFont(imported);
      flash(`Imported ${file.name} — ${imported.glyphs.length} glyphs`);
    } catch (error) {
      console.error("Failed to import the BDF file:", error);
      flash("Import failed — not a valid BDF file");
    }
  };

  return (
    <>
      <main className="absolute inset-0 flex select-none flex-col bg-background text-foreground">
        <Appbar active="font">
          <Button
            variant="outline"
            size="sm"
            title="Import a BDF file"
            onClick={() => fileRef.current?.click()}
          >
            Import BDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Export as BDF"
            onClick={() =>
              download(`${font.name || "untitled"}.bdf`, serializeBDF(font))
            }
          >
            Export BDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Start a new font"
            onClick={() => useNewFontDialog.getState().show()}
          >
            New Font
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Generate u8g2 / Adafruit GFX font code"
            onClick={showFontCodeDialog}
          >
            Code
          </Button>
        </Appbar>

        <section className="flex min-h-0 flex-1">
          <aside className="relative w-84 shrink-0 border-r-[1.5px] border-neutral-700">
            <GlyphList />
          </aside>
          <article className="flex min-w-0 flex-1 flex-col">
            <div className="shrink-0 border-b-[1.5px] border-neutral-700">
              <Toolbar />
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="flex min-h-full min-w-full items-center justify-center p-6">
                {glyph ? (
                  <GlyphCanvas glyph={glyph} />
                ) : (
                  <div className="text-xs text-muted-foreground/60">
                    No glyph selected — add one from the glyph browser
                  </div>
                )}
              </div>
            </div>
            <Preview className="shrink-0 border-t-[1.5px] border-neutral-700" />
          </article>
          <aside className="relative w-64 shrink-0 border-l-[1.5px] border-neutral-700">
            <PropertiesPanel />
          </aside>
        </section>

        <footer className="flex h-8 shrink-0 items-center justify-between border-t-[1.5px] border-neutral-700 px-4 font-mono text-xs text-muted-foreground">
          <div className="flex gap-4">
            {glyph && (
              <span>
                {formatCode(glyph.code)} "{String.fromCodePoint(glyph.code)}"
              </span>
            )}
            <span>{tool}</span>
            {notice && <span className="text-neutral-300">{notice}</span>}
          </div>
          <div className="flex gap-4">
            <span>{hover ? `${hover.col}, ${hover.row}` : "-, -"}</span>
            <span>{onPixels} px</span>
            <span>
              {font.box.w}x{font.box.h}
            </span>
          </div>
        </footer>
      </main>

      <input
        ref={fileRef}
        type="file"
        accept=".bdf,text/plain"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) handleImport(file);
        }}
      />
      <ConfirmDialog />
      <NewFontDialog
        onCreate={(selected, fillGlyphs) =>
          setFont(blankFont(selected, fillGlyphs))
        }
      />
      <FontCodeDialog />
    </>
  );
}

export default App;
