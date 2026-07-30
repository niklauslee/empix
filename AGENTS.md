# Empix Studio

A browser-based graphic editor for embedded devices with monochrome displays. It
draws into a packed 1-bpp pixel buffer (like a real display framebuffer) and
generates [u8g2](https://github.com/olikraus/u8g2) C/C++ or XBM code from the
scene. Local-first: no backend, no login — the scene is persisted in
`localStorage`.

Astro (static output) + React islands, deployed to Cloudflare Workers.

> `CLAUDE.md` is a symlink to this file. Edit `AGENTS.md`.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

Other commands:

- `npm run build` / `npm run preview` — production build and local preview
- `npm run generate-types` — `wrangler types` (Cloudflare Worker bindings)
- `node tools/generate-fonts.js` — regenerate `src/font-data.ts` from `res/bdf/`

There is no test framework. Verify changes by running the dev server and
exercising the editor.

## Architecture

Three layers, from inside out:

1. **`src/components/editor/`** — the editor core. Plain TypeScript, no React
   (except `editor-component.tsx`), no app knowledge. Renders to a canvas.
2. **`src/engine/`** — app services: commands, keymap, code generation.
3. **`src/components/`, `src/store/`** — React UI (shadcn + Tailwind v4) that
   observes the editor through zustand stores.

`src/app-context.ts` glues them: `AppContext` is a singleton exposed as
`window.app`, and holds `editor`, `commands`, `keymap`, `codeGenerator`. Its
`wiring()` subscribes to editor events and pushes state into `useEditorStore`;
every action also triggers `saveData()` (`localStorage["app-data"]`).
`initialize()` additionally loads the keymap, the embedded BDF fonts, the saved
scene, and registers commands.

Entry point: `src/pages/index.astro` renders `<App client:only="react" />`.

### Editor core (`src/components/editor/`)

- `editor.ts` — `Editor` plus the interaction framework: `Handler` /
  `HandlerManager` (active tool), `Manipulator` / `ManipulatorManager` /
  `Controller` (per-shape-type selection handles), `SelectionManager`.
  Owns canvas creation, pointer/keyboard wiring, `repaint()`, grid/border
  drawing, and `loadFromJSON` / `saveToJSON`.
- `graphics.ts` — `GraphicContext`: a packed `Uint8Array` buffer sized
  `ceil(width * bpp / 8) * height`, with `putPixel`/`getPixel`, Bresenham line
  and ellipse, BDF text rendering (4 directions), XBM bitmap blitting, and
  `renderBuffer()` which paints the buffer onto the canvas as scaled rects.
  `toPixelCoord` / `toCanvasCoord` convert between canvas and pixel space.
- `shapes.ts` — shapes are **plain serializable objects** (`Shape` and its
  variants: Rectangle, Ellipse, Line, Text, Pen, Bitmap), never classes.
  Behavior lives in free functions: `render`, `renderOutline`, `getOutline`,
  `getBoundingRect`, `containsPoint`, `overlapRect`, `move`. `ShapeFactory`
  creates defaults and emits `onCreate`.
- `store.ts` — the shape list (`Store.shapes`), JSON in/out.
- `transform.ts` — the only sanctioned way to mutate shapes. Mutations
  (`assign`, `insert`, `delete`, `reorder`) are recorded into an action between
  `begin()` and `end()`, which is what makes undo/redo work (`Stack`, max 100
  actions).
- `handlers.ts` — tools: `SelectHandler` plus one factory handler per shape type.
- `manipulators.ts` / `controllers.ts` — move/resize/point-edit controllers.
- `actions.ts` — `PredefinedActions`: undo, redo, copy/cut/paste, delete,
  duplicate, move, z-order, update props. UI and commands call these.
- `geometry.ts`, `utils.ts`, `consts.ts` (`Color`, `Cursor`, `Mouse`),
  `std.ts` (`TypedEvent`, `Stack`), `clipboard.ts`, `font.ts`.

### Engine (`src/engine/`)

- `command-manager.ts` — `app.commands.register(id, description, zodShape, handler)`
  and `execute(id, args)` with Zod validation. Command ids are namespaced:
  `edit:`, `shape:`, `align:`, `tool:`, `view:`. All registered in
  `src/commands.ts`.
- `keymap-manager.ts` — binds `src/keymap.json` to command ids. `mod-` means
  Cmd on macOS, Ctrl elsewhere. Formatted key labels are mirrored into
  `useKeymapStore` for display in the UI.
- `code-generator.ts` — `generateU8g2(editor, {lang: "c" | "cpp", useProgmem})`
  walks the shapes emitting u8g2 calls, tracking draw color / font / font
  direction so redundant setters are skipped; Pen shapes become XBM byte arrays.
  `generateXBM(editor)` dumps the whole framebuffer instead.

### UI

- `app.tsx` — appbar, `LayersPanel`, `Toolbar`, `PropertiesPanel`,
  `EditorComponent`, and the dialogs. `editor-component.tsx`'s `basicSetup()`
  declares the handler and manipulator registry plus canvas defaults
  (128×64, bpp 1, scale 5).
- `src/store/editor-store.ts` — read-only mirror of editor state for React
  (`shapes`, `selection`, `size`, `scale`, `activeHandler`, and an
  `actionSequence` counter bumped on every action to force re-render).
- Dialogs (`dialogs/confirm-dialog.tsx`, `dialogs/code-dialog.tsx`) each own a
  small zustand store, so any code can open them via
  `useConfirmDialog.getState().show(...)` /
  `useCodeDialog.getState().setOpen(true)`.
- `src/components/ui/` is shadcn (style `base-lyra`, built on Base UI) — see
  `components.json`. Icons: hand-written SVGs in `src/components/icons/`, plus
  `@phosphor-icons/react`.

### Font editor (`src/components/font-editor/`)

A second, self-contained app at `src/pages/font.astro`: a BDF glyph editor. It
shares only the `ui/`, `icons/` and `dialogs/` components — it does not use the
editor core, `AppContext` or the engine.

- `bdf.ts` — the `Font` / `Glyph` model plus `parseBDF` / `serializeBDF`. Every
  glyph bitmap is stored in the **font bounding box frame** (one fixed grid for
  the whole font); per-glyph `BBX` is recomputed tightly on serialization. BDF y
  points up from the baseline, grid rows go down:
  `y = box.oy + box.h - 1 - row`.
- `draw.ts` — pixel operations (pen, line, rect, flood fill, shift, flip,
  invert). They take and return `boolean[]`, never mutate.
- `font-store.ts` — zustand store: font, selected codepoint, tool, zoom, and an
  undo stack of bitmap patches (structural edits clear it). Persists the font as
  BDF text in `localStorage["font-data"]`, debounced.
- `render.ts` — canvas helpers (`drawGlyph`, `drawText`) used by the glyph
  browser, the editing grid and the preview.
- `app.tsx` — layout, import/export, keyboard shortcuts; with `glyph-list.tsx`,
  `toolbar.tsx`, `glyph-canvas.tsx`, `properties.tsx`, `preview.tsx`,
  `embedded-font-menu.tsx`.

### Fonts

Two unrelated font pipelines:

- **Scene fonts (BDF)**: `res/bdf/*.bdf` → `node tools/generate-fonts.js` →
  `src/font-data.ts` (generated; deflate + base64 — do not edit by hand).
  `AppContext.loadFonts()` inflates each and registers it with `bdfparser`
  through `editor/font.ts`. Font names must match the u8g2 map in
  `code-generator.ts` for codegen to pick the right u8g2 font.
- **UI fonts (TTF)**: `public/fonts/*.ttf` declared in `src/styles/fonts.css`.

## Conventions

- Never mutate a shape directly. Go through `editor.actions.*`, or wrap
  `editor.transform.assign/insert/delete/reorder` in
  `transform.begin()` … `transform.end()`. Direct mutation silently breaks
  undo/redo, the React mirror, and persistence.
- Color is a number: `0` = off, `1` = on, `-1` = XOR (emitted as u8g2 draw color
  `2`). All coordinates are integer device pixels.
- Adding a shape type touches, in order: `shapes.ts` (interface, factory case,
  `render`/`getOutline`/`containsPoint`/`move`) → `handlers.ts` →
  `manipulators.ts` + `controllers.ts` → `basicSetup()` in
  `editor-component.tsx` → `properties.tsx` → `code-generator.ts`.
- Adding a command: register it in `src/commands.ts` and bind a key in
  `src/keymap.json`; invoke with `window.app.commands.execute(id)`.
- Import alias `@/*` → `src/*`. TypeScript is `astro/tsconfigs/strict`.
- Debugging: `window.app` (app context) and `window.editor` (editor instance).

## Deployment

Static Astro output with the Cloudflare adapter, served by a Worker
(`wrangler.jsonc`, assets from `./dist`). Live at
<https://empix.niklauslee.workers.dev/>

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
