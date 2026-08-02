import { useEditorStore } from "@/apps/scene-editor/store/editor-store";
import { Button } from "@/components/ui/button";
import { useKeymapStore } from "@/apps/scene-editor/store/keymap-store";
import {
  BringToFrontIcon,
  CircleIcon,
  CopyIcon,
  MinusIcon,
  MousePointer2Icon,
  PencilIcon,
  PlusIcon,
  Redo2Icon,
  SendToBackIcon,
  SlashIcon,
  SquareIcon,
  Trash2Icon,
  TypeIcon,
  Undo2Icon,
} from "lucide-react";

export function Toolbar() {
  const activeHandler = useEditorStore((state) => state.activeHandler);
  const formattedKeys = useKeymapStore((state) => state.formattedKeys);

  return (
    <div className="w-full flex flex-col justify-start">
      <div className="w-full flex flex-row items-start justify-between px-4 py-3">
        <div className="text-xl flex flex-row items-start justify-center gap-1">
          <Button
            title={`Select ⎯ ${formattedKeys["tool:select"]}`}
            variant={activeHandler === "Select" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Select");
            }}
          >
            <MousePointer2Icon />
          </Button>
          <Button
            title={`Rectangle ⎯ ${formattedKeys["tool:rectangle"]}`}
            variant={activeHandler === "Rectangle" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Rectangle");
            }}
          >
            <SquareIcon />
          </Button>
          <Button
            title={`Ellipse ⎯ ${formattedKeys["tool:ellipse"]}`}
            variant={activeHandler === "Ellipse" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Ellipse");
            }}
          >
            <CircleIcon />
          </Button>
          <Button
            title={`Line ⎯ ${formattedKeys["tool:line"]}`}
            variant={activeHandler === "Line" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Line");
            }}
          >
            <SlashIcon />
          </Button>
          <Button
            title={`Text ⎯ ${formattedKeys["tool:text"]}`}
            variant={activeHandler === "Text" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Text");
            }}
          >
            <TypeIcon />
          </Button>
          <Button
            title={`Pen ⎯ ${formattedKeys["tool:pen"]}`}
            variant={activeHandler === "Pen" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => {
              window.app.editor.handlers.setActiveHandler("Pen");
            }}
          >
            <PencilIcon />
          </Button>
          {/* <Button
          variant={activeHandler === "Bitmap" ? "default" : "outline"}
          size="icon-sm"
          
          onClick={() => {
            window.app.editor.handlers.setActiveHandler("Bitmap");
          }}
        >
          <ImageIcon />
        </Button> */}
        </div>
        <div className="text-xl flex flex-row items-center justify-center gap-1">
          <Button
            title={`Zoom In ⎯ ${formattedKeys["view:zoom-in"]}`}
            variant="outline"
            size="icon-sm"
            onClick={() => {
              window.app.commands.execute("view:zoom-in");
            }}
          >
            <PlusIcon />
          </Button>
          <Button
            title={`Zoom Out ⎯ ${formattedKeys["view:zoom-out"]}`}
            variant="outline"
            size="icon-sm"
            onClick={() => {
              window.app.commands.execute("view:zoom-out");
            }}
          >
            <MinusIcon />
          </Button>
          <Button
            title={`Undo ⎯ ${formattedKeys["edit:undo"]}`}
            variant="outline"
            size="icon-sm"
            onClick={() => {
              window.app.editor.actions.undo();
            }}
          >
            <Undo2Icon />
          </Button>
          <Button
            title={`Redo ⎯ ${formattedKeys["edit:redo"]}`}
            variant="outline"
            size="icon-sm"
            onClick={() => {
              window.app.editor.actions.redo();
            }}
          >
            <Redo2Icon />
          </Button>
          <Button
            title={`Delete ⎯ ${formattedKeys["edit:delete"]}`}
            variant="outline"
            size="icon-sm"
            onClick={() => {
              window.app.editor.actions.delete();
            }}
          >
            <Trash2Icon />
          </Button>
          <Button
            title={`Duplicate ⎯ ${formattedKeys["edit:duplicate"]}`}
            variant="outline"
            size="icon-sm"
            onClick={() => {
              window.app.editor.actions.duplicate();
            }}
          >
            <CopyIcon />
          </Button>
          <Button
            title={`Bring to Front ⎯ ${formattedKeys["align:bring-to-front"]}`}
            variant="outline"
            size="icon-sm"
            onClick={() => {
              window.app.editor.actions.bringToFront();
            }}
          >
            <BringToFrontIcon />
          </Button>
          <Button
            title={`Send to Back ⎯ ${formattedKeys["align:send-to-back"]}`}
            variant="outline"
            size="icon-sm"
            onClick={() => {
              window.app.editor.actions.sendToBack();
            }}
          >
            <SendToBackIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
