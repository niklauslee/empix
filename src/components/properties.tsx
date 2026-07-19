import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Shape, ShapeProps } from "./editor/shapes";
import { TextField } from "./ui/text-field";
import { NumberField } from "./ui/number-field";
import { ScrollArea } from "./ui/scroll-area";

export interface ShapeEditorProps {
  selection: Shape[];
  onChange: (values: ShapeProps) => void;
}

export const NameEdit: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  const shape = selection[0];

  return (
    <div>
      <div className="flex gap-2 w-full">
        <Label className="text-sm" htmlFor="input-name">
          Name
        </Label>
        <TextField
          id="input-name"
          className="text-sm"
          value={shape?.name ?? ""}
          onChange={(value) => onChange({ name: value })}
        />
      </div>
    </div>
  );
};

export const PositionEdit: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  const shape = selection[0];
  return (
    <div className="flex w-full gap-4">
      <div className="flex gap-2 w-full">
        <Label className="text-sm" htmlFor="input-x">
          X
        </Label>
        <NumberField
          id="input-x"
          className="text-sm"
          type="number"
          value={shape?.left ?? 0}
          onChange={(value) => onChange({ left: value })}
        />
      </div>
      <div className="flex gap-2 w-full">
        <Label className="text-sm" htmlFor="input-y">
          Y
        </Label>
        <NumberField
          id="input-y"
          className="text-sm"
          type="number"
          value={shape?.top ?? 0}
          onChange={(value) => onChange({ top: value })}
        />
      </div>
    </div>
  );
};

export const PropertiesPanel: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-0 top-0 h-8 flex items-center px-4">
        <div className="text-muted-foreground">Properties</div>
      </div>
      <div className="absolute inset-x-0 top-8 bottom-0">
        <ScrollArea className="w-full h-full">
          <div className="flex flex-col gap-3 px-4 py-2">
            {selection.length === 1 && (
              <>
                <NameEdit selection={selection} onChange={onChange} />
                <PositionEdit selection={selection} onChange={onChange} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
