import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  ShapeType,
  type LineShape,
  type Shape,
  type ShapeProps,
  type TextShape,
} from "./editor/shapes";
import { TextField } from "./ui/text-field";
import { NumberField } from "./ui/number-field";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableFonts } from "./editor/font";
import { Button } from "./ui/button";

export interface ShapeEditorProps {
  selection: Shape[];
  onChange: (values: ShapeProps) => void;
}

export const NameEdit: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  if (selection.length === 0) return null;
  const shape = selection[0];

  return (
    <div>
      <div className="flex gap-2 w-full">
        <Label className="text-sm w-16" htmlFor="input-name">
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
  if (selection.length === 0) return null;
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

export const SizeEdit: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  if (selection.length === 0) return null;
  const shape = selection[0];
  if (shape.type !== ShapeType.RECTANGLE && shape.type !== ShapeType.ELLIPSE)
    return null;

  return (
    <div className="flex w-full gap-4">
      <div className="flex gap-2 w-full">
        <Label className="text-sm" htmlFor="input-width">
          W
        </Label>
        <NumberField
          id="input-width"
          className="text-sm"
          type="number"
          value={shape?.width ?? 0}
          onChange={(value) => onChange({ width: value })}
        />
      </div>
      <div className="flex gap-2 w-full">
        <Label className="text-sm" htmlFor="input-height">
          H
        </Label>
        <NumberField
          id="input-height"
          className="text-sm"
          type="number"
          value={shape?.height ?? 0}
          onChange={(value) => onChange({ height: value })}
        />
      </div>
    </div>
  );
};

export const FillEdit: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  if (selection.length === 0) return null;
  const shape = selection[0];
  if (shape.type !== ShapeType.RECTANGLE && shape.type !== ShapeType.ELLIPSE)
    return null;

  return (
    <div>
      <div className="flex items-center gap-2 w-full">
        <Label className="text-sm w-16" htmlFor="input-name">
          Fill
        </Label>
        <div className="flex gap-2 w-full">
          <Checkbox
            checked={(shape as any).fill ?? false}
            onCheckedChange={(value) => onChange({ fill: value })}
          />
        </div>
      </div>
    </div>
  );
};

export const ClosedEdit: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  if (selection.length === 0) return null;
  const shape = selection[0];
  if (shape.type !== ShapeType.LINE) return null;

  return (
    <div>
      <div className="flex items-center gap-2 w-full">
        <Label className="text-sm w-16" htmlFor="input-name">
          Closed
        </Label>
        <div className="flex gap-2 w-full">
          <Checkbox
            checked={(shape as LineShape).closed ?? false}
            onCheckedChange={(value) => onChange({ closed: value })}
          />
        </div>
      </div>
    </div>
  );
};

export const ColorEdit: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  if (selection.length === 0) return null;
  const shape = selection[0];
  const color = shape.color ?? 0;

  return (
    <div>
      <div className="flex items-center gap-2 w-full">
        <Label className="text-sm w-16" htmlFor="input-color">
          Color
        </Label>
        <div className="flex gap-1 w-full justify-between">
          <Button
            variant={color === 0 ? "default" : "outline"}
            size="icon-xs"
            className="size-7"
            onClick={() => {
              onChange({ color: 0 });
            }}
          >
            0
          </Button>
          <Button
            variant={color === 1 ? "default" : "outline"}
            size="icon-xs"
            className="size-7"
            onClick={() => {
              onChange({ color: 1 });
            }}
          >
            1
          </Button>
          <Button
            variant={color === -1 ? "default" : "outline"}
            size="icon-xs"
            className="w-10 h-7 p-0"
            onClick={() => {
              onChange({ color: -1 });
            }}
          >
            XOR
          </Button>
        </div>
      </div>
    </div>
  );
};

export const TextEdit: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  if (selection.length === 0) return null;
  const shape = selection[0];
  if (shape.type !== ShapeType.TEXT) return null;

  const items = availableFonts.map((font) => ({
    label: font.name,
    value: font.name,
  }));

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 w-full">
        <Label className="text-sm w-16" htmlFor="input-text">
          Font
        </Label>
        <Select
          items={items}
          value={(shape as TextShape).font ?? ""}
          onValueChange={(value) => onChange({ font: value ?? "" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 w-full">
        <Label className="text-sm w-16" htmlFor="input-text">
          Text
        </Label>
        <TextField
          id="input-text"
          className="text-sm"
          value={(shape as TextShape).text ?? ""}
          onChange={(value) => onChange({ text: value })}
        />
      </div>
    </div>
  );
};

export const PropertiesPanel: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  const shape = selection.length === 1 ? selection[0] : null;

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-0 top-0 h-8 flex items-center px-4">
        <div className="">Properties</div>
      </div>
      <div className="absolute inset-x-0 top-8 bottom-0">
        <ScrollArea className="w-full h-full">
          <div className="flex flex-col gap-3 px-4 py-2">
            <NameEdit selection={selection} onChange={onChange} />
            <PositionEdit selection={selection} onChange={onChange} />
            <SizeEdit selection={selection} onChange={onChange} />
            <ColorEdit selection={selection} onChange={onChange} />
            <FillEdit selection={selection} onChange={onChange} />
            <ClosedEdit selection={selection} onChange={onChange} />
            <TextEdit selection={selection} onChange={onChange} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
