import { app, AppContext } from "@/apps/screen-editor/app-context";
import { Editor } from "@/components/editor/editor";
import { EditorComponent } from "@/components/editor/editor-component";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/dialogs/confirm-dialog";
import { Layout } from "./layout";
import { Toolbar } from "./toolbar";
import { Appbar } from "@/components/appbar";
import { PropertiesPanel } from "./properties";
import type { ShapeProps } from "@/components/editor/shapes";
import { useEditorStore } from "@/apps/screen-editor/store/editor-store";
import { LayersPanel } from "./layers";
import { ScrollAreaBoth } from "@/components/ui/scroll-area-both";
import { CodeDialog, useCodeDialog } from "@/components/dialogs/code-dialog";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    app: AppContext;
  }
}

function App() {
  const selection = useEditorStore((state) => state.selection);
  // for ui update when actions are performed
  const actionSequence = useEditorStore((state) => state.actionSequence);

  const handleMount = (editor: Editor) => {
    app.initialize(editor);
    editor.fit();
    editor.repaint();
  };

  const handlePropsChange = (props: ShapeProps) => {
    try {
      const app = window.app;
      app.editor.actions.update(props);
    } catch (error) {
      console.error("Error handling props change:", error);
    }
  };

  return (
    <>
      <Layout
        appbar={
          <Appbar active="screen">
            <Button
              variant="outline"
              onClick={() => {
                useConfirmDialog
                  .getState()
                  .show(
                    "Clear Canvas",
                    "Are you sure you want to clear the canvas? This action cannot be undone.",
                    () => {
                      window.app.editor.clear();
                      window.app.updateUI();
                    },
                  );
              }}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                useCodeDialog.getState().setOpen(true);
              }}
            >
              Code
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                // FIXME: Only works in Chromium-based browsers
                try {
                  const [fileHandle] = await (window as any).showOpenFilePicker({
                    types: [
                      {
                        description: "Empix file",
                        accept: { "application/json": [".empix"] },
                      },
                    ],
                    multiple: false,
                  });
                  const file = await fileHandle.getFile();
                  const text = await file.text();
                  window.app.editor.loadFromJSON(JSON.parse(text));
                  window.app.updateUI();
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
                    suggestedName: "untitled.empix",
                    types: [
                      {
                        description: "Empix file",
                        accept: { "application/json": [".empix"] },
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
          </Appbar>
        }
        leftSidebar={
          <LayersPanel className="border-r-[1.5px] border-neutral-700" />
        }
        rightSidebar={
          <PropertiesPanel
            className="border-l-[1.5px] border-neutral-700"
            selection={selection}
            onChange={handlePropsChange}
          />
        }
        onContentResize={() => {
          // setTimeout(() => window.app?.editor.fit());
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-start w-full h-full">
          <div className="border-b-[1.5px] border-neutral-700 absolute inset-x-0 top-0 h-14 w-full flex flex-col justify-start">
            <Toolbar />
          </div>
          <div className="absolute inset-x-0 top-14 bottom-0 flex items-center justify-center">
            <ScrollAreaBoth className="w-full h-full flex items-center justify-center">
              <div className="w-full h-full flex items-start justify-center">
                <EditorComponent onMount={handleMount} />
              </div>
            </ScrollAreaBoth>
          </div>
        </div>
      </Layout>
      <ConfirmDialog />
      <CodeDialog />
    </>
  );
}

export default App;
