import { app, AppContext } from "@/app-context";
import { Editor } from "./editor/editor";
import { EditorComponent } from "./editor/editor-component";
import { Layout } from "./layout";
import { Toolbar } from "./toolbar";

declare global {
  interface Window {
    app: AppContext;
  }
}

function App() {
  const handleMount = (editor: Editor) => {
    app.setEditor(editor);
    editor.fit();
    editor.repaint();
  };

  return (
    <>
      <Layout
        appbar={
          <div className="flex items-center justify-start w-full h-full px-4">
            <h1 className="text-5xl font-bold text-green-600 py-2">
              Empix Studio
            </h1>
          </div>
        }
        leftSidebar={
          <div className="w-full h-full px-4 py-2">
            <div className="text-xl leading-0 my-4">Screens / Layers</div>
            <div className="flex flex-col gap-4">
              <div className="w-40 h-24 bg-slate-800 border"></div>
              <div className="w-40 h-24 bg-slate-800 border"></div>
            </div>
          </div>
        }
        rightSidebar={<div>right sidebar</div>}
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
