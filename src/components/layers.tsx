import { cn } from "@/lib/utils";
import { ShapeType, type Shape } from "./editor/shapes";
import {
  RectangleIcon,
  EllipseIcon,
  LineIcon,
  TextIcon,
  BitmapIcon,
  PenIcon,
} from "./icons";
import { ScrollArea } from "./ui/scroll-area";
import { useEditorStore } from "@/store/editor-store";

interface LayersPanelProps {}

const LayerItem: React.FC<{
  shape: Shape;
  selected: boolean;
}> = ({ shape, selected = false }) => {
  return (
    <div
      className={cn(
        "text-sm h-8 w-full flex items-center justify-start gap-2 px-4 cursor-pointer hover:bg-neutral-800",
        selected && "bg-neutral-700",
      )}
    >
      <div className="min-w-4 min-h-4 flex items-center justify-center">
        {shape.type === ShapeType.RECTANGLE && <RectangleIcon size={14} />}
        {shape.type === ShapeType.ELLIPSE && <EllipseIcon size={14} />}
        {shape.type === ShapeType.LINE && <LineIcon size={14} />}
        {shape.type === ShapeType.TEXT && <TextIcon size={14} />}
        {shape.type === ShapeType.PEN && <PenIcon size={14} />}
        {shape.type === ShapeType.BITMAP && <BitmapIcon size={14} />}
      </div>
      <div className="truncate">{shape.name}</div>
    </div>
  );
};

export const LayersPanel: React.FC<LayersPanelProps> = ({}) => {
  const shapes = useEditorStore((state) => state.shapes).toReversed();
  const selection = useEditorStore((state) => state.selection);

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-0 top-0 h-8 flex items-center px-4">
        <div>Layers</div>
      </div>
      <div className="absolute inset-x-0 top-8 bottom-0">
        <ScrollArea className="w-full h-full">
          {shapes.length === 0 && (
            <div className="px-4 h-8 mt-2 text-sm text-muted-foreground">
              No shapes
            </div>
          )}
          <div className="flex flex-col gap-0 py-2">
            {shapes.map((shape) => (
              <LayerItem
                key={shape.id}
                shape={shape}
                selected={selection.some((s) => s.id === shape.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
