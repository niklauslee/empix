import { useEffect, useRef, useState } from "react";
import {
  DownloadIcon,
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  SquarePenIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { Appbar } from "@/components/appbar";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/dialogs/confirm-dialog";
import { authClient } from "@/lib/auth-client";
import {
  createFont,
  createGlyph,
  findGlyph,
  remapPixels,
  serializeBDF,
  type Font,
  type Glyph,
} from "@/apps/font-editor/bdf";
import { loadDefaultGlyphSource } from "@/apps/font-editor/font-store";
import { codepointsForRanges } from "./charsets";
import { NewFontDialog, useNewFontDialog } from "./new-font-dialog";
import { Sidebar, type DashboardView } from "./sidebar";

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

interface FontRow {
  id: string;
  name: string;
  glyphCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SceneRow {
  id: string;
  name: string;
  width: number;
  height: number;
  shapeCount: number;
  createdAt: string;
  updatedAt: string;
}

/** A blank scene, same defaults as `editor-component.tsx`'s `basicSetup()`. */
function blankScene() {
  return JSON.stringify({
    width: 128,
    height: 64,
    bpp: 1,
    scale: 5,
    shapes: [],
  });
}

interface DashboardUser {
  name: string;
  image?: string | null;
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(await response.text());
  return response;
}

function App({ user }: { user: DashboardUser }) {
  const [scenes, setScenes] = useState<SceneRow[] | null>(null);
  const [fonts, setFonts] = useState<FontRow[] | null>(null);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState<DashboardView>("scenes");
  const fileRef = useRef<HTMLInputElement>(null);
  const sceneFileRef = useRef<HTMLInputElement>(null);

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  };

  const load = async () => {
    try {
      const [scenesResponse, fontsResponse] = await Promise.all([
        api("/api/scenes"),
        api("/api/fonts"),
      ]);
      setScenes(await scenesResponse.json());
      setFonts(await fontsResponse.json());
    } catch (error) {
      console.error("Failed to load the dashboard:", error);
      flash("Failed to load your scenes and fonts");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUploadScene = async (file: File) => {
    try {
      const data = await file.text();
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed.shapes)) throw new Error("not a scene file");
      const name = file.name.replace(/\.empix$/i, "");
      const response = await api("/api/scenes", {
        method: "POST",
        body: JSON.stringify({ name, data }),
      });
      const created: SceneRow = await response.json();
      setScenes((current) => [created, ...(current ?? [])]);
      flash(`Uploaded ${file.name}`);
    } catch (error) {
      console.error("Failed to upload the scene:", error);
      flash("Upload failed — not a valid .empix file");
    }
  };

  const handleCreateScene = async () => {
    try {
      const response = await api("/api/scenes", {
        method: "POST",
        body: JSON.stringify({ name: "untitled", data: blankScene() }),
      });
      const created: SceneRow = await response.json();
      location.href = `/scene?id=${created.id}`;
    } catch (error) {
      console.error("Failed to create the scene:", error);
      flash("Failed to create the scene");
    }
  };

  const handleRenameScene = async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const previous = scenes;
    setScenes(
      (current) =>
        current?.map((s) => (s.id === id ? { ...s, name: trimmed } : s)) ??
        current,
    );
    try {
      await api(`/api/scenes/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: trimmed }),
      });
    } catch (error) {
      console.error("Failed to rename the scene:", error);
      flash("Rename failed");
      setScenes(previous);
    }
  };

  const handleDeleteScene = (row: SceneRow) => {
    useConfirmDialog
      .getState()
      .show(
        "Delete Scene",
        `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
        async () => {
          const previous = scenes;
          setScenes(
            (current) => current?.filter((s) => s.id !== row.id) ?? current,
          );
          try {
            await api(`/api/scenes/${row.id}`, { method: "DELETE" });
          } catch (error) {
            console.error("Failed to delete the scene:", error);
            flash("Delete failed");
            setScenes(previous);
          }
        },
      );
  };

  const handleDownloadScene = async (row: SceneRow) => {
    try {
      const response = await api(`/api/scenes/${row.id}`);
      const full: SceneRow & { data: string } = await response.json();
      download(`${full.name}.empix`, full.data);
    } catch (error) {
      console.error("Failed to download the scene:", error);
      flash("Download failed");
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const data = await file.text();
      if (!data.includes("STARTFONT")) throw new Error("not a valid BDF file");
      const name = file.name.replace(/\.bdf$/i, "");
      const response = await api("/api/fonts", {
        method: "POST",
        body: JSON.stringify({ name, data }),
      });
      const created: FontRow = await response.json();
      setFonts((current) => [created, ...(current ?? [])]);
      flash(`Uploaded ${file.name}`);
    } catch (error) {
      console.error("Failed to upload the font:", error);
      flash("Upload failed — not a valid BDF file");
    }
  };

  const handleCreate = async (selected: Set<string>, fillGlyphs: boolean) => {
    try {
      const data = serializeBDF(blankFont(selected, fillGlyphs));
      const response = await api("/api/fonts", {
        method: "POST",
        body: JSON.stringify({ name: "untitled", data }),
      });
      const created: FontRow = await response.json();
      location.href = `/font?id=${created.id}`;
    } catch (error) {
      console.error("Failed to create the font:", error);
      flash("Failed to create the font");
    }
  };

  const handleRename = async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const previous = fonts;
    setFonts(
      (current) =>
        current?.map((f) => (f.id === id ? { ...f, name: trimmed } : f)) ??
        current,
    );
    try {
      await api(`/api/fonts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: trimmed }),
      });
    } catch (error) {
      console.error("Failed to rename the font:", error);
      flash("Rename failed");
      setFonts(previous);
    }
  };

  const handleDelete = (row: FontRow) => {
    useConfirmDialog
      .getState()
      .show(
        "Delete Font",
        `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
        async () => {
          const previous = fonts;
          setFonts(
            (current) => current?.filter((f) => f.id !== row.id) ?? current,
          );
          try {
            await api(`/api/fonts/${row.id}`, { method: "DELETE" });
          } catch (error) {
            console.error("Failed to delete the font:", error);
            flash("Delete failed");
            setFonts(previous);
          }
        },
      );
  };

  const handleDownload = async (row: FontRow) => {
    try {
      const response = await api(`/api/fonts/${row.id}`);
      const full: FontRow & { data: string } = await response.json();
      download(`${full.name}.bdf`, full.data);
    } catch (error) {
      console.error("Failed to download the font:", error);
      flash("Download failed");
    }
  };

  return (
    <>
      <main className="absolute inset-0 flex select-none flex-col bg-background text-foreground">
        <Appbar active="dashboard">
          <div className="flex items-center gap-2 pl-2">
            {user.image && (
              <img src={user.image} alt="" className="size-6 rounded-full" />
            )}
            <span className="text-xs text-muted-foreground">{user.name}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Sign out"
              onClick={async () => {
                await authClient.signOut();
                location.href = "/login";
              }}
            >
              <LogOutIcon className="size-3.5" />
            </Button>
          </div>
        </Appbar>

        <div className="flex min-h-0 flex-1">
          <Sidebar
            active={view}
            onChange={setView}
            sceneCount={scenes?.length ?? null}
            fontCount={fonts?.length ?? null}
          />

          <div className="min-h-0 flex-1 overflow-auto">
            <div className="mx-auto max-w-3xl px-6 py-8">
              {notice && (
                <div className="mb-3 text-xs text-neutral-300">{notice}</div>
              )}

              {view === "scenes" && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h1 className="text-sm font-medium">Scenes</h1>
                      {scenes && (
                        <span className="text-xs text-muted-foreground">
                          {scenes.length} scene{scenes.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Start a new scene"
                        onClick={handleCreateScene}
                      >
                        <PlusIcon className="size-3.5" />
                        New Scene
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Upload an .empix file"
                        onClick={() => sceneFileRef.current?.click()}
                      >
                        <UploadIcon className="size-3.5" />
                        Upload Scene
                      </Button>
                    </div>
                  </div>

                  <div className="mb-8 border-[1.5px] border-neutral-800">
                    <div className="grid grid-cols-[1fr_80px_70px_180px_116px] items-center gap-2 border-b-[1.5px] border-neutral-800 px-4 py-2 text-xs text-muted-foreground">
                      <div>Name</div>
                      <div>Shapes</div>
                      <div>Size</div>
                      <div>Updated</div>
                      <div className="text-right">Actions</div>
                    </div>

                    {scenes === null && (
                      <div className="px-4 py-6 text-center text-xs text-muted-foreground/60">
                        Loading…
                      </div>
                    )}

                    {scenes !== null && scenes.length === 0 && (
                      <div className="px-4 py-6 text-center text-xs text-muted-foreground/60">
                        No scenes yet — start one from the scene editor and save
                        it to your account.
                      </div>
                    )}

                    {scenes?.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[1fr_80px_70px_180px_116px] items-center gap-2 border-b-[1.5px] border-neutral-800 px-4 py-2 text-xs last:border-b-0"
                      >
                        <div className="flex items-center gap-1.5 pr-2">
                          <PencilIcon className="size-3 shrink-0 text-muted-foreground/60" />
                          <TextField
                            value={row.name}
                            onChange={(name) => handleRenameScene(row.id, name)}
                            className="h-7"
                          />
                        </div>
                        <div className="text-muted-foreground">
                          {row.shapeCount}
                        </div>
                        <div className="text-muted-foreground">
                          {row.width}x{row.height}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(row.updatedAt).toLocaleString()}
                        </div>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Open in Scene Editor"
                            onClick={() =>
                              (location.href = `/scene?id=${row.id}`)
                            }
                          >
                            <SquarePenIcon className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Download as .empix"
                            onClick={() => handleDownloadScene(row)}
                          >
                            <DownloadIcon className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Delete"
                            onClick={() => handleDeleteScene(row)}
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {view === "fonts" && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h1 className="text-sm font-medium">Fonts</h1>
                      {fonts && (
                        <span className="text-xs text-muted-foreground">
                          {fonts.length} font{fonts.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Start a new font"
                        onClick={() => useNewFontDialog.getState().show()}
                      >
                        <PlusIcon className="size-3.5" />
                        New Font
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Upload a BDF file"
                        onClick={() => fileRef.current?.click()}
                      >
                        <UploadIcon className="size-3.5" />
                        Upload Font
                      </Button>
                    </div>
                  </div>

                  <div className="border-[1.5px] border-neutral-800">
                    <div className="grid grid-cols-[1fr_80px_180px_116px] items-center gap-2 border-b-[1.5px] border-neutral-800 px-4 py-2 text-xs text-muted-foreground">
                      <div>Name</div>
                      <div>Glyphs</div>
                      <div>Updated</div>
                      <div className="text-right">Actions</div>
                    </div>

                    {fonts === null && (
                      <div className="px-4 py-6 text-center text-xs text-muted-foreground/60">
                        Loading…
                      </div>
                    )}

                    {fonts !== null && fonts.length === 0 && (
                      <div className="px-4 py-6 text-center text-xs text-muted-foreground/60">
                        No fonts yet — export one from the font editor and
                        upload it here.
                      </div>
                    )}

                    {fonts?.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[1fr_80px_180px_116px] items-center gap-2 border-b-[1.5px] border-neutral-800 px-4 py-2 text-xs last:border-b-0"
                      >
                        <div className="flex items-center gap-1.5 pr-2">
                          <PencilIcon className="size-3 shrink-0 text-muted-foreground/60" />
                          <TextField
                            value={row.name}
                            onChange={(name) => handleRename(row.id, name)}
                            className="h-7"
                          />
                        </div>
                        <div className="text-muted-foreground">
                          {row.glyphCount}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(row.updatedAt).toLocaleString()}
                        </div>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Open in Font Editor"
                            onClick={() =>
                              (location.href = `/font?id=${row.id}`)
                            }
                          >
                            <SquarePenIcon className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Download as BDF"
                            onClick={() => handleDownload(row)}
                          >
                            <DownloadIcon className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Delete"
                            onClick={() => handleDelete(row)}
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <input
        ref={sceneFileRef}
        type="file"
        accept=".empix,application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) handleUploadScene(file);
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept=".bdf,text/plain"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) handleUpload(file);
        }}
      />
      <ConfirmDialog />
      <NewFontDialog onCreate={handleCreate} />
    </>
  );
}

export default App;
