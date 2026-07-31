# Empix Studio

Two browser-based editors for embedded devices with monochrome displays:

- **Scene editor** (`/scene`) — draws into a packed 1-bpp pixel buffer (like a
  real display framebuffer) and generates
  [u8g2](https://github.com/olikraus/u8g2) C/C++ or XBM code from the scene.
- **Font editor** (`/font`) — a BDF glyph editor.

Local-first: no backend for the editors themselves — the scene is persisted in
`localStorage`. The only backend surface is `/login`, which authenticates via
GitHub OAuth (through [better-auth](https://better-auth.com)) against a
Cloudflare D1 database; `/scene` and `/font` don't require a session.

Astro (server output, most pages still prerendered) + React islands, deployed
to Cloudflare Workers.

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

## Layout of the source tree

```
src/
  pages/            routes: index.astro (redirect → /scene), scene.astro,
                    font.astro, login.astro, api/auth/[...all].ts (better-auth handler)
  middleware.ts     populates Astro.locals.user/session for every request
  apps/
    scene-editor/  the u8g2 scene editor app (AppContext, engine, UI, commands)
    font-editor/    the BDF glyph editor app (self-contained)
  components/
    editor/         reusable editor core — canvas, shapes, tools, undo/redo
    ui/             shadcn components
    icons/          hand-written SVG icons
    dialogs/        confirm + code dialogs (each owns a small zustand store)
    astro/head.astro, logo.tsx
  lib/
    utils.ts        cn, detectPlatform, generateNewName, odd
    auth.ts         server-side better-auth instance (getAuth(), lazy — see Auth)
    auth-client.ts  better-auth browser client, used from login.astro's inline script
    db/schema.ts    Drizzle schema for better-auth's D1-backed tables
  font-data.ts      generated — embedded BDF fonts (deflate + base64)
  styles/           global.css (Tailwind v4 + theme), fonts.css (@font-face)
```

Both pages render `<App client:only="react" />` inside `<body class="dark">`
(there is no light theme) with the shared `components/astro/head.astro`, which
takes an optional `title` and includes the Google Analytics tag. The two apps
link to each other from their appbars; `/` just redirects to `/scene`.

The apps share `components/editor/`, `ui/`, `icons/`, `dialogs/`, `logo.tsx`,
`lib/utils.ts` and `font-data.ts` — nothing else. In particular the font editor
does not touch the editor core, `AppContext` or the engine.

## Scene editor

Three layers, from inside out:

1. **`src/components/editor/`** — the editor core. Plain TypeScript, no React
   (except `editor-component.tsx`), no app knowledge. Renders to a canvas.
2. **`src/apps/scene-editor/engine/`** — app services: commands, keymap, code
   generation.
3. **`src/apps/scene-editor/*.tsx`, `src/apps/scene-editor/store/`** — React UI
   (shadcn + Tailwind v4) that observes the editor through zustand stores.

`src/apps/scene-editor/app-context.ts` glues them: `AppContext` is a singleton
exposed as `window.app`, and holds `editor`, `commands`, `keymap`,
`codeGenerator`. Its `wiring()` subscribes to editor events and pushes state into
`useEditorStore`; every action also triggers `saveData()`
(`localStorage["app-data"]`). `initialize(editor)` additionally loads the keymap,
the embedded BDF fonts, the saved scene, and registers commands. It is called
from `app.tsx`'s `onMount` handler on `EditorComponent`.

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
- `editor-component.tsx` — the React wrapper. Its `basicSetup()` declares the
  handler and manipulator registry plus canvas defaults (128×64, bpp 1,
  margin 32, scale 5), and exposes `window.editor` for debugging.
- `geometry.ts`, `utils.ts`, `consts.ts` (`Color`, `Cursor`, `Mouse`),
  `std.ts` (`TypedEvent`, `Stack`), `clipboard.ts`, `font.ts`.

### Engine (`src/apps/scene-editor/engine/`)

- `command-manager.ts` — `app.commands.register(id, description, zodShape, handler)`
  and `execute(id, args)` with Zod validation. Command ids are namespaced:
  `edit:`, `shape:`, `align:`, `tool:`, `view:`. All registered in
  `../commands.ts`.
- `keymap-manager.ts` — binds `../keymap.json` to command ids. `mod-` means
  Cmd on macOS, Ctrl elsewhere. Formatted key labels are mirrored into
  `useKeymapStore` for display in the UI (button tooltips).
- `code-generator.ts` — `generateU8g2(editor, {lang: "c" | "cpp", useProgmem})`
  walks the shapes emitting u8g2 calls, tracking draw color / font / font
  direction so redundant setters are skipped; Pen shapes become XBM byte arrays.
  `generateXBM(editor)` dumps the whole framebuffer instead.

### UI (`src/apps/scene-editor/`)

- `app.tsx` — composes `layout.tsx` (appbar / left sidebar / right sidebar /
  content) with `LayersPanel`, `Toolbar`, `PropertiesPanel`, `EditorComponent`
  and the dialogs. The appbar holds the Scene/Font nav, Clear, Code, and
  Import / Export of `.empix` files (JSON via the File System Access API —
  Chromium only, marked `FIXME`).
- `store/editor-store.ts` — read-only mirror of editor state for React
  (`shapes`, `selection`, `width`, `height`, `scale`, `activeHandler`,
  `activeHandlerLock`, and an `actionSequence` counter bumped on every action to
  force re-render). `store/keymap-store.ts` holds the formatted key labels.
- `toolbar.tsx` — canvas size fields, tool buttons, zoom/undo/redo/z-order
  actions. The Bitmap tool is registered in the core but its toolbar button is
  commented out.
- `properties.tsx`, `layers.tsx` — right and left panels.
- Dialogs live in `src/components/dialogs/` and each own a small zustand store,
  so any code can open them via `useConfirmDialog.getState().show(...)` /
  `useCodeDialog.getState().setOpen(true)`. `code-dialog.tsx` picks the target
  (u8g2 / XBM), the language (`cpp` = Arduino, `c` = Zephyr) and PROGMEM, then
  calls the code generator on open.
- `src/components/ui/` is shadcn (style `base-lyra`, built on Base UI) — see
  `components.json`. Icons: hand-written SVGs in `src/components/icons/`, plus
  `@phosphor-icons/react`.

## Font editor (`src/apps/font-editor/`)

A self-contained BDF glyph editor at `/font`. No editor core, no `AppContext`,
no engine, no command manager — keyboard shortcuts are a single `keydown`
listener in `app.tsx`.

- `bdf.ts` — the `Font` / `Glyph` model plus `parseBDF` / `serializeBDF`. Every
  glyph bitmap is stored in the **font bounding box frame** (one fixed grid for
  the whole font); per-glyph `BBX` is recomputed tightly on serialization. BDF y
  points up from the baseline, grid rows go down:
  `y = box.oy + box.h - 1 - row`. Also `createFont` / `createGlyph` /
  `resizeBox` / `findGlyph` / `formatCode`.
- `draw.ts` — pixel operations (pen, eraser, line, rect, flood fill, shift,
  flip, invert, clear) and the `Tool` union. They take and return `boolean[]`,
  never mutate.
- `font-store.ts` — zustand store: font, selected codepoint, tool, cell size,
  guides, glyph filter, preview text, hover cell, and an undo stack of bitmap
  patches (structural edits — import, add/remove glyph, box resize — clear it).
  The font is **not** persisted — it starts from a seed font (`6x13`, trimmed to
  printable ASCII) and is kept in memory only, because serializing thousands of
  glyphs to BDF on every edit made `localStorage` writes stall the browser.
  Import / Export is the way in and out.
- `render.ts` — canvas helpers (`setupCanvas`, `drawGlyph`, `measureText`,
  `drawText`) used by the glyph browser, the editing grid and the preview.
- `app.tsx` — layout (appbar / glyph list / grid + preview / properties /
  status bar), import/export, New font, keyboard shortcuts; with
  `glyph-list.tsx`, `toolbar.tsx`, `glyph-canvas.tsx`, `properties.tsx`,
  `preview.tsx`, `embedded-font-menu.tsx` (open one of the embedded fonts).

## Fonts

Two unrelated font pipelines:

- **BDF fonts**: `res/bdf/*.bdf` → `node tools/generate-fonts.js` →
  `src/font-data.ts` (generated; deflate + base64 — do not edit by hand),
  exposing `availableFonts` and `getEmbeddedFontBDF(name)`. The scene editor's
  `AppContext.loadFonts()` inflates each and registers it with `bdfparser`
  through `editor/font.ts`; the font editor uses the same data as seeds. Font
  names must match the u8g2 map in `engine/code-generator.ts` for codegen to
  pick the right u8g2 font.
- **UI fonts (TTF)**: `public/fonts/*.ttf` declared in `src/styles/fonts.css`.

## Auth

`/login` is the only page that isn't a pure client-side SPA shell. GitHub is
the sole provider — there's no email/password.

- `src/lib/auth.ts` — `getAuth()` lazily builds the `betterAuth` instance the
  first time it's called _during a request_. It must not be constructed at
  module load time: bindings/secrets are read via `import { env } from
"cloudflare:workers"`, which only resolves inside request handling
  (`Astro.locals.runtime.env` doesn't exist on this Astro/adapter version
  anymore). Once built, the instance is memoized — bindings don't change
  between requests.
- `src/pages/api/auth/[...all].ts` — the better-auth catch-all handler.
- `src/middleware.ts` — calls `getAuth().api.getSession()` on every request
  and sets `Astro.locals.user` / `Astro.locals.session` (typed in
  `src/env.d.ts`), so `login.astro` can render signed-in vs signed-out
  server-side with no client flash. It does not gate `/scene` or `/font`.
- `src/lib/db/schema.ts` — hand-written Drizzle schema for better-auth's core
  tables (`user`, `session`, `account`, `verification`). Hand-written rather
  than generated by the better-auth CLI because generation would need to
  import the real auth config, which pulls in `cloudflare:workers` — not
  resolvable outside workerd.
- Migrations live in `drizzle/migrations/`, generated with `npx drizzle-kit
generate` (schema-diff only, no DB connection needed) and applied with
  `npx wrangler d1 migrations apply DB --local` / `--remote` — not
  `drizzle-kit migrate`, which D1 doesn't support directly.
- Local secrets go in `.dev.vars` (gitignored; `.dev.vars.example` documents
  the shape: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `BETTER_AUTH_SECRET`).
  Production secrets are set with `wrangler secret put`.
- The `d1_databases` binding in `wrangler.jsonc` needs a real `database_id`
  from `wrangler d1 create` before deploying — the checked-in value is a
  placeholder.

## Conventions

- Never mutate a shape directly. Go through `editor.actions.*`, or wrap
  `editor.transform.assign/insert/delete/reorder` in
  `transform.begin()` … `transform.end()`. Direct mutation silently breaks
  undo/redo, the React mirror, and persistence.
- Color is a number: `0` = off, `1` = on, `-1` = XOR (emitted as u8g2 draw color
  `2`). All coordinates are integer device pixels.
- Adding a shape type touches, in order: `components/editor/shapes.ts`
  (interface, factory case, `render`/`getOutline`/`containsPoint`/`move`) →
  `handlers.ts` → `manipulators.ts` + `controllers.ts` → `basicSetup()` in
  `editor-component.tsx` → `apps/scene-editor/properties.tsx` →
  `apps/scene-editor/engine/code-generator.ts`.
- Adding a command: register it in `src/apps/scene-editor/commands.ts` and bind
  a key in `src/apps/scene-editor/keymap.json`; invoke with
  `window.app.commands.execute(id)`.
- Code shared by both apps belongs in `src/components/` or `src/lib/`;
  app-specific code stays under its `src/apps/<app>/` directory.
- Import alias `@/*` → `src/*`. TypeScript is `astro/tsconfigs/strict`.
- Debugging: `window.app` (app context) and `window.editor` (editor instance) —
  scene editor only.

## Deployment

Astro `output: "server"` with the Cloudflare adapter, served by a Worker
(`wrangler.jsonc`, assets from `./dist`, `nodejs_compat` flag required by
better-auth's password-hashing utils). `/`, `/scene` and `/font` set
`export const prerender = true` so they still ship as static HTML; `/login`
and `/api/auth/*` are rendered on demand and need the `DB` (D1) binding plus
`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `BETTER_AUTH_SECRET` secrets to
work. Live at <https://empix.niklauslee.workers.dev/>

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
