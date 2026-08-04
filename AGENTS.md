# Empix Studio

Two browser-based editors for embedded devices with monochrome displays:

- **Scene editor** (`/scene`) — draws into a packed 1-bpp pixel buffer (like a
  real display framebuffer) and generates
  [u8g2](https://github.com/olikraus/u8g2) C/C++ or XBM code from the scene.
- **Font editor** (`/font`) — a BDF glyph editor.

Editing works anonymously with no account: the scene autosaves to
`localStorage` and the font stays in memory (import/export). Signing in with
GitHub adds a **dashboard** (`/dashboard`) that saves scenes and fonts
per-user to a Cloudflare D1 database, so they can be reopened from any
browser.

Astro, server-rendered, + React islands, deployed to Cloudflare Workers
(`@astrojs/cloudflare`) with a D1 binding — not a static-assets-only site.

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

Database (D1 via Drizzle, no npm script wraps these yet — run directly):

- `npx drizzle-kit generate` — add a migration under `drizzle/migrations` after
  editing `src/lib/db/schema.ts`
- `npx wrangler d1 migrations apply DB --local` / `--remote` — apply pending
  migrations to the local dev DB or the remote D1 database

Local dev needs a `.dev.vars` (gitignored, see `.dev.vars.example`) with
`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (GitHub OAuth app) and
`BETTER_AUTH_SECRET`.

There is no test framework. Verify changes by running the dev server and
exercising the editor.

## Layout of the source tree

```
src/
  pages/
    index.astro     landing page; redirects to /dashboard if signed in
    login.astro     GitHub sign-in (better-auth), redirects to /dashboard if signed in
    dashboard.astro auth-required; redirects to /login if not signed in
    scene.astro     scene editor; ?id= loads a saved scene (auth-required only then)
    font.astro      font editor; ?id= loads a saved font (auth-required only then)
    api/
      auth/[...all].ts    better-auth catch-all handler
      scenes/index.ts, scenes/[id].ts   CRUD for the signed-in user's scenes
      fonts/index.ts, fonts/[id].ts     CRUD for the signed-in user's fonts
  apps/
    scene-editor/  the u8g2 scene editor app (AppContext, engine, UI, commands)
    font-editor/    the BDF glyph editor app (self-contained)
    dashboard/      lists/manages a signed-in user's saved scenes and fonts
  components/
    editor/         reusable editor core — canvas, shapes, tools, undo/redo
    ui/             shadcn components
    icons/          hand-written SVG icons
    dialogs/        confirm + code dialogs (each owns a small zustand store)
    astro/head.astro, logo.tsx, appbar.tsx
  lib/
    utils.ts        cn, detectPlatform, generateNewName, odd
    auth.ts         getAuth() — lazy better-auth singleton (GitHub OAuth + D1)
    auth-client.ts  authClient — better-auth browser client (signIn/signOut)
    db/             schema.ts (Drizzle), index.ts (getDb()), fonts.ts, scenes.ts
  middleware.ts     resolves the session on every request into Astro.locals
  font-data.ts      generated — embedded BDF fonts (deflate + base64)
  styles/           global.css (Tailwind v4 + theme), fonts.css (@font-face)
```

All pages render their app's `<App client:only="react" />` inside
`<body class="dark">` (there is no light theme) with the shared
`components/astro/head.astro`, which takes an optional `title` and includes
the Google Analytics tag. `scene.astro`/`font.astro`/`dashboard.astro` share
`components/appbar.tsx` for their header (logo, current-page label, a
"Dashboard" back-link, and app-specific actions on the right).

The apps share `components/editor/`, `ui/`, `icons/`, `dialogs/`, `logo.tsx`,
`appbar.tsx`, `lib/utils.ts` and `font-data.ts` — nothing else. In particular
the font editor does not touch the editor core, `AppContext` or the engine.

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
(`localStorage["app-data"]`), the always-on anonymous draft autosave.
`initialize(editor, initialData?)` additionally loads the keymap, the embedded
BDF fonts, and registers commands; when `initialData` is given (a scene loaded
server-side from D1 via `?id=`, see `scene.astro`) it takes priority over the
localStorage draft and is loaded via `loadFromJSON` instead. It is called from
`app.tsx`'s `onMount` handler on `EditorComponent`.

Cloud save is opt-in and separate from the localStorage draft: `app.tsx` shows
a **Save** button (only when signed in — otherwise a "Sign in to Save" link to
`/login`) that `POST`s `/api/scenes` the first time and `PATCH`s
`/api/scenes/:id` afterward, then updates the URL to `/scene?id=...` via
`history.replaceState`. Saving to the cloud never touches or clears the
localStorage draft.

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
  and the dialogs. Uses the shared `components/appbar.tsx` for Clear, Code,
  Import / Export of `.empix` files (JSON via the File System Access API —
  Chromium only, marked `FIXME`) and the Save / "Sign in to Save" cloud-save
  action (see above).
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
  The font is **not** persisted locally — it starts from a seed font (`6x13`,
  trimmed to printable ASCII) and is kept in memory only, because serializing
  thousands of glyphs to BDF on every edit made `localStorage` writes stall
  the browser. Import / Export or cloud Save (below) are the ways in and out;
  only the cell-size (zoom) preference lives in `localStorage`.
- `render.ts` — canvas helpers (`setupCanvas`, `drawGlyph`, `measureText`,
  `drawText`) used by the glyph browser, the editing grid and the preview.
- `app.tsx` — layout (appbar / glyph list / grid + preview / properties /
  status bar), import/export, New font, keyboard shortcuts; with
  `glyph-list.tsx`, `toolbar.tsx`, `glyph-canvas.tsx`, `properties.tsx`,
  `preview.tsx`, `embedded-font-menu.tsx` (open one of the embedded fonts).
  When opened via `/font?id=`, `initialFont.data` is parsed with `parseBDF()`
  into the store on mount. Same Save / "Sign in to Save" pattern as the scene
  editor (`POST`/`PATCH` `/api/fonts`), independent of the in-memory-only
  default.

## Dashboard, auth & cloud persistence

- **Auth**: `src/lib/auth.ts` — `getAuth()`, a lazily-constructed `betterAuth()`
  singleton (GitHub OAuth only, via `socialProviders.github`, backed by
  `drizzleAdapter`). Lazy because `env` (bindings/secrets) comes from
  `cloudflare:workers` and is only readable while handling a request; the
  instance is memoized after that. `src/lib/auth-client.ts` exports
  `authClient` (better-auth's browser client — `authClient.signIn.social(...)`,
  `authClient.signOut()`), calling same-origin `/api/auth/*`.
- **Session middleware**: `src/middleware.ts` runs on every request, calls
  `getAuth().api.getSession(...)` and sets `Astro.locals.user` /
  `Astro.locals.session` (or `null`). Pages and API routes read
  `Astro.locals.user` / `locals.user` directly — there's no separate
  "requireAuth" helper, each route checks and redirects/401s itself.
- **Database**: `src/lib/db/schema.ts` (Drizzle, SQLite dialect, D1 binding
  `DB`) has better-auth's core tables (`user`, `session`, `account`,
  `verification` — hand-written, not generated, because generation needs
  `better-auth`'s config which pulls in `cloudflare:workers`) plus two app
  tables: `scene` (`data` = `Editor#saveToJSON` output, `width`/`height`/
  `shapeCount` mirrored for listing) and `font` (`data` = raw BDF text,
  `glyphCount` mirrored). Both are `userId`-scoped with `onDelete: "cascade"`.
  `src/lib/db/index.ts` — `getDb()`, same lazy-singleton pattern as
  `getAuth()`. `db/fonts.ts` (`countGlyphs`) and `db/scenes.ts`
  (`parseSceneData`) derive the mirrored metadata without importing the
  editor/font-editor code.
- **API routes** (`src/pages/api/`): `scenes/index.ts` (`GET` list metadata
  only, `POST` create) and `scenes/[id].ts` (`GET`/`PATCH`/`DELETE`), mirrored
  by `fonts/index.ts` / `fonts/[id].ts`. Every query is scoped with
  `eq(<table>.userId, user.id)`, so another user's row 404s rather than 403s.
  `auth/[...all].ts` just forwards to `getAuth().handler(request)`.
- **Dashboard app** (`src/apps/dashboard/`, route `/dashboard`, redirects to
  `/login` if signed out): `app.tsx` fetches `/api/scenes` and `/api/fonts` on
  mount and renders a two-tab (Scenes/Fonts) table via `sidebar.tsx` — create,
  inline rename (optimistic, rolls back on failure), delete (via the shared
  `ConfirmDialog`), download (blobs the full row to `.empix`/`.bdf`), and
  upload. "New Scene" / "New Font" create a blank row then navigate to
  `/scene?id=…` / `/font?id=…`. `new-font-dialog.tsx` + `charsets.ts` pick
  Unicode glyph ranges (optionally pre-filled from the embedded 6x13 font)
  when creating a font.
- `scene.astro` / `font.astro` stay usable **anonymously** — auth is only
  enforced when the URL carries `?id=`: signed out → redirect to `/login`;
  signed in but the row doesn't belong to you → redirect back to the
  id-less URL. When it resolves, the row is fetched server-side via Drizzle
  and passed as `initialScene`/`initialFont` (plus `user: {name, image} |
  null`) props to the React app.

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

Server-rendered: `astro.config.mjs` sets `output: "server"` with the
`@astrojs/cloudflare` adapter, so `astro build` emits a Worker (not just
static assets). `wrangler.jsonc` sets `main` to the adapter's server
entrypoint, an `assets` binding for `./dist`, and a `d1_databases` binding
(`DB`, database `empix`, migrations in `drizzle/migrations`). Secrets
(`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `BETTER_AUTH_SECRET`) come from
`.dev.vars` locally and Worker secrets in production. Live at
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
