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
          <div className="flex items-center justify-start w-full h-full px-4">
            <Logo size={1.5} className="text-green-600" />
            <div className="text-xl ml-3">studio</div>
          </div>
        }
        leftSidebar={<LayersPanel />}
        rightSidebar={
          <PropertiesPanel selection={selection} onChange={handlePropsChange} />
        }
        onContentResize={() => {
          // setTimeout(() => window.app?.editor.fit());
        }}
      >
        <div className="flex flex-col items-center justify-start w-full h-full mt-0">
          <Toolbar />
          <EditorComponent onMount={handleMount} />
        </div>
      </Layout>
    </>
  );
}

export default App;
