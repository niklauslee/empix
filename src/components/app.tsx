import { app, AppContext } from "@/app-context";
import { Editor } from "./editor/editor";
import { EditorComponent } from "./editor/editor-component";
import { Layout } from "./layout";
import { Toolbar } from "./toolbar";
import Logo from "./logo";
import { PropertiesPanel } from "./properties";
import type { ShapeProps } from "./editor/shapes";
import { useEditorStore } from "@/store/editor-store";
import { LayersPanel } from "./layers";
import { ScrollAreaBoth } from "./ui/scroll-area-both";

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
          <div className="flex items-center justify-start w-full h-full px-4 border-b-[1.5px]">
            <Logo size={1.5} className="text-green-600" />
            <div className="text-xl ml-3">studio</div>
          </div>
        }
        leftSidebar={<LayersPanel className="border-r-[1.5px]" />}
        rightSidebar={
          <PropertiesPanel
            className="border-l-[1.5px]"
            selection={selection}
            onChange={handlePropsChange}
          />
        }
        onContentResize={() => {
          // setTimeout(() => window.app?.editor.fit());
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-start w-full h-full">
          <div className="border-b-[1.5px] absolute inset-x-0 top-0 h-28 w-full flex flex-col justify-start">
            <Toolbar />
          </div>
          <div className="absolute inset-x-0 top-28 bottom-0 flex items-center justify-center">
            <ScrollAreaBoth className="w-full h-full flex items-center justify-center">
              <div className="w-full h-full flex items-start justify-center">
                <EditorComponent onMount={handleMount} />
              </div>
            </ScrollAreaBoth>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default App;
