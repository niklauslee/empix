/**
 * Font editor state. The font lives in memory only — unlike the screen editor
 * it is *not* persisted: serializing a few thousand glyphs to BDF on every edit
 * made `localStorage` writes stall the browser. Use Import / Export to keep
 * work across reloads.
 */

import { create } from "zustand";
import { getEmbeddedFontBDF } from "@/font-data";
import {
  createFont,
  createGlyph,
  findGlyph,
  parseBDF,
  resizeBox,
  type Box,
  type Font,
  type Glyph,
} from "./bdf";
import type { Point, Tool } from "./draw";

/** Font loaded on first run, trimmed to printable ASCII. */
const SEED_FONT = "6x13";
const SEED_RANGE = [0x20, 0x7e];
const MAX_UNDO = 100;

const CELL_SIZE_KEY = "font-editor-cell-size";
const MIN_CELL_SIZE = 4;
const MAX_CELL_SIZE = 48;
const DEFAULT_CELL_SIZE = 22;

/** Editing grid zoom, unlike the font itself, is cheap to persist. */
function loadCellSize(): number {
  const stored = Number(localStorage.getItem(CELL_SIZE_KEY));
  if (Number.isFinite(stored) && stored > 0) {
    return Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, stored));
  }
  return DEFAULT_CELL_SIZE;
}

/**
 * An undoable bitmap edit. Only bitmap edits are undoable — structural changes
 * (import, add/remove glyph, box resize) clear the stacks instead.
 */
interface Patch {
  code: number;
  before: boolean[];
  after: boolean[];
}

export interface FontEditorState {
  font: Font;
  /** Codepoint of the glyph being edited, `-1` when the font has no glyphs. */
  code: number;
  tool: Tool;
  /** Editing grid zoom, in screen pixels per font pixel. */
  cellSize: number;
  showGuides: boolean;
  /** Glyph browser search term. */
  filter: string;
  previewText: string;
  /** Grid cell under the pointer, shown in the status bar. */
  hover: Point | null;
  undoStack: Patch[];
  redoStack: Patch[];

  glyph: () => Glyph | null;
  setFont: (font: Font) => void;
  selectCode: (code: number) => void;
  selectAdjacent: (delta: number) => void;
  setTool: (tool: Tool) => void;
  setCellSize: (cellSize: number) => void;
  setShowGuides: (showGuides: boolean) => void;
  setFilter: (filter: string) => void;
  setPreviewText: (previewText: string) => void;
  setHover: (hover: Point | null) => void;
  /** Replace the selected glyph's bitmap, recording it for undo. */
  commitPixels: (pixels: boolean[]) => void;
  updateFont: (
    changes: Partial<Omit<Font, "glyphs" | "box">> & { box?: Partial<Box> },
  ) => void;
  updateGlyph: (code: number, changes: Partial<Omit<Glyph, "pixels">>) => void;
  addGlyph: (code: number) => void;
  removeGlyph: (code: number) => void;
  undo: () => void;
  redo: () => void;
}

function seedFont(): Font {
  const font = parseBDF(getEmbeddedFontBDF(SEED_FONT));
  return {
    ...font,
    glyphs: font.glyphs.filter(
      (glyph) => glyph.code >= SEED_RANGE[0] && glyph.code <= SEED_RANGE[1],
    ),
  };
}

function initialFont(): Font {
  try {
    return seedFont();
  } catch (error) {
    console.error("Failed to load the seed font:", error);
    return createFont();
  }
}

/** The full (untrimmed) seed font, offered as a glyph source for new fonts. */
export function loadDefaultGlyphSource(): Font | null {
  try {
    return parseBDF(getEmbeddedFontBDF(SEED_FONT));
  } catch (error) {
    console.error("Failed to load the default glyph font:", error);
    return null;
  }
}

function firstCode(font: Font): number {
  const printable = font.glyphs.find((glyph) => glyph.code >= 0x41);
  return (printable ?? font.glyphs[0])?.code ?? -1;
}

/** Replace a single glyph in place. */
function withGlyph(font: Font, glyph: Glyph): Font {
  const glyphs = font.glyphs.map((item) =>
    item.code === glyph.code ? glyph : item,
  );
  return { ...font, glyphs };
}

const font = initialFont();

export const useFontStore = create<FontEditorState>()((set, get) => ({
  font,
  code: firstCode(font),
  tool: "pen",
  cellSize: loadCellSize(),
  showGuides: true,
  filter: "",
  previewText: "Handgloves 0123",
  hover: null,
  undoStack: [],
  redoStack: [],

  glyph: () => findGlyph(get().font, get().code),

  setFont: (font) =>
    set({ font, code: firstCode(font), undoStack: [], redoStack: [] }),

  selectCode: (code) => set({ code }),

  selectAdjacent: (delta) => {
    const { font, code } = get();
    const index = font.glyphs.findIndex((glyph) => glyph.code === code);
    const next = font.glyphs[index + delta];
    if (next) set({ code: next.code });
  },

  setTool: (tool) => set({ tool }),
  setCellSize: (cellSize) => {
    const clamped = Math.max(
      MIN_CELL_SIZE,
      Math.min(MAX_CELL_SIZE, Math.round(cellSize)),
    );
    localStorage.setItem(CELL_SIZE_KEY, String(clamped));
    set({ cellSize: clamped });
  },
  setShowGuides: (showGuides) => set({ showGuides }),
  setFilter: (filter) => set({ filter }),
  setPreviewText: (previewText) => set({ previewText }),
  setHover: (hover) => set({ hover }),

  commitPixels: (pixels) => {
    const { font, code, undoStack } = get();
    const glyph = findGlyph(font, code);
    if (!glyph || glyph.pixels === pixels) return;
    const patch: Patch = { code, before: glyph.pixels, after: pixels };
    set({
      font: withGlyph(font, { ...glyph, pixels }),
      undoStack: [...undoStack, patch].slice(-MAX_UNDO),
      redoStack: [],
    });
  },

  updateFont: (changes) => {
    const { font } = get();
    const box: Box = { ...font.box, ...(changes.box ?? {}) };
    const resized = resizeBox(font, box);
    const structural = resized !== font;
    set({
      font: { ...resized, ...changes, box },
      ...(structural ? { undoStack: [], redoStack: [] } : {}),
    });
  },

  updateGlyph: (code, changes) => {
    const { font } = get();
    const glyph = findGlyph(font, code);
    if (!glyph) return;
    const next = { ...glyph, ...changes };
    if (next.code !== code && findGlyph(font, next.code)) return; // taken
    const glyphs = font.glyphs
      .map((item) => (item.code === code ? next : item))
      .sort((a, b) => a.code - b.code);
    set({ font: { ...font, glyphs }, code: next.code });
  },

  addGlyph: (code) => {
    const { font } = get();
    if (findGlyph(font, code)) {
      set({ code });
      return;
    }
    const glyphs = [...font.glyphs, createGlyph(font, code)].sort(
      (a, b) => a.code - b.code,
    );
    set({ font: { ...font, glyphs }, code, undoStack: [], redoStack: [] });
  },

  removeGlyph: (code) => {
    const { font } = get();
    const index = font.glyphs.findIndex((glyph) => glyph.code === code);
    if (index < 0) return;
    const glyphs = font.glyphs.filter((glyph) => glyph.code !== code);
    const neighbor = glyphs[Math.min(index, glyphs.length - 1)];
    set({
      font: { ...font, glyphs },
      code: neighbor?.code ?? -1,
      undoStack: [],
      redoStack: [],
    });
  },

  undo: () => {
    const { font, undoStack, redoStack } = get();
    const patch = undoStack.at(-1);
    if (!patch) return;
    const glyph = findGlyph(font, patch.code);
    if (!glyph) return;
    set({
      font: withGlyph(font, { ...glyph, pixels: patch.before }),
      code: patch.code,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, patch],
    });
  },

  redo: () => {
    const { font, undoStack, redoStack } = get();
    const patch = redoStack.at(-1);
    if (!patch) return;
    const glyph = findGlyph(font, patch.code);
    if (!glyph) return;
    set({
      font: withGlyph(font, { ...glyph, pixels: patch.after }),
      code: patch.code,
      undoStack: [...undoStack, patch].slice(-MAX_UNDO),
      redoStack: redoStack.slice(0, -1),
    });
  },
}));
