import { app, AppContext } from "@/app-context";
import { Editor } from "./editor/editor";
import { EditorComponent } from "./editor/editor-component";
import { Layout } from "./layout";
import { Toolbar } from "./toolbar";
import Logo from "./logo";
import { Inspector } from "./inspector";
import type { ShapeProps } from "./editor/shapes";
import { useEditingStore } from "@/store/editing-store";
import { ScenesPanel } from "./scenes-panel";

declare global {
  interface Window {
    app: AppContext;
  }
}

function App() {
  const selection = useEditingStore((state) => state.selection);
  // for ui update when actions are performed
  const actionSequence = useEditingStore((state) => state.actionSequence);

  const handleMount = (editor: Editor) => {
    app.initialize(editor);
    editor.fit();
    editor.repaint();
  };

  const handlePropsChange = (props: ShapeProps) => {
    try {
      const app = window.app;
      app.editor.updateProps(props);
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
        leftSidebar={<ScenesPanel />}
        rightSidebar={
          <Inspector selection={selection} onChange={handlePropsChange} />
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
