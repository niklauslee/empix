import { app, AppContext } from "@/app-context";
import { Editor } from "./editor/editor";
import { EditorComponent } from "./editor/editor-component";
import { Layout } from "./layout";
import { Toolbar } from "./toolbar";
import Logo from "./logo";
import { ScrollArea } from "./ui/scroll-area";
import { Inspector } from "./inspector";

declare global {
  interface Window {
    app: AppContext;
  }
}

function App() {
  const handleMount = (editor: Editor) => {
    app.initialize(editor);
    editor.fit();
    editor.repaint();
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
        leftSidebar={
          <ScrollArea className="w-full h-full">
            <div className="w-full h-full px-4 py-2">
              <div className="text-sm leading-0 my-4">Scenes | Layers</div>
              <div className="flex flex-col gap-4">
                <div className="w-40 h-24 bg-slate-800 border"></div>
                <div className="w-40 h-24 bg-slate-800 border"></div>
              </div>
            </div>
          </ScrollArea>
        }
        rightSidebar={
          <div className="w-full h-full px-4 py-2">
            <div className="text-sm leading-0 my-4">Properties</div>
            <Inspector />
          </div>
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
