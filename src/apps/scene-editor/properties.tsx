import { cn, odd } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  type EllipseShape,
  ShapeType,
  type LineShape,
  type Shape,
  type ShapeProps,
  type TextShape,
} from "@/components/editor/shapes";
import { TextField } from "@/components/ui/text-field";
import { NumberField } from "@/components/ui/number-field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableFonts } from "../../font-data";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/apps/scene-editor/store/editor-store";

export interface ShapeEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  selection: Shape[];
  onChange: (values: ShapeProps) => void;
}

/** Canvas size — a document property, not tied to the selection. */
export const SceneEdit: React.FC = () => {
  const width = useEditorStore((state) => state.width);
  const height = useEditorStore((state) => state.height);

  return (
    <div className="flex w-full gap-4">
      <div className="flex gap-2 w-full">
        <Label
          className="text-sm"
          htmlFor="input-editor-width"
          title="Scene Width"
        >
          W
        </Label>
        <NumberField
          id="input-editor-width"
          title="Scene Width"
          className="text-sm"
          type="number"
          value={width}
          onChange={(value) => {
            window.app.editor.setSize(value, height);
          }}
        />
      </div>
      <div className="flex gap-2 w-full">
        <Label
          className="text-sm"
          htmlFor="input-editor-height"
          title="Scene Height"
        >
          H
        </Label>
        <NumberField
          id="input-editor-height"
          title="Scene Height"
          className="text-sm"
          type="number"
          value={height}
          onChange={(value) => {
            window.app.editor.setSize(width, value);
          }}
        />
      </div>
    </div>
  );
};

export const NameEdit: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  if (selection.length === 0) return null;
  const shape = selection[0];

  return (
    <div>
      <div className="flex gap-2 w-full">
        <Label className="text-sm w-16" htmlFor="input-name" title="Name">
          Name
        </Label>
        <TextField
          id="input-name"
          title="Name"
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
  const isEllipse = shape.type === ShapeType.ELLIPSE;
  const x = isEllipse ? (shape as EllipseShape).x : shape.left;
  const y = isEllipse ? (shape as EllipseShape).y : shape.top;

  const xLabel = isEllipse ? "CX" : "X";
  const yLabel = isEllipse ? "CY" : "Y";

  return (
    <div className="flex w-full gap-4">
      <div className="flex gap-2 w-full">
        <Label className="text-sm" htmlFor="input-x" title={xLabel}>
          {xLabel}
        </Label>
        <NumberField
          id="input-x"
          title={xLabel}
          className="text-sm"
          type="number"
          value={x ?? 0}
          onChange={(value) =>
            onChange(isEllipse ? { x: value } : { left: value })
          }
        />
      </div>
      <div className="flex gap-2 w-full">
        <Label className="text-sm" htmlFor="input-y" title={yLabel}>
          {yLabel}
        </Label>
        <NumberField
          id="input-y"
          title={yLabel}
          className="text-sm"
          type="number"
          value={y ?? 0}
          onChange={(value) =>
            onChange(isEllipse ? { y: value } : { top: value })
          }
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
  const isEllipse = shape.type === ShapeType.ELLIPSE;
  const w = isEllipse ? (shape as EllipseShape).rx : shape.width;
  const h = isEllipse ? (shape as EllipseShape).ry : shape.height;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex w-full gap-4">
        <div className="flex gap-2 w-full">
          <Label
            className="text-sm"
            htmlFor="input-width"
            title={isEllipse ? "Radius X" : "Width"}
          >
            {isEllipse ? "RX" : "W"}
          </Label>
          <NumberField
            id="input-width"
            title={isEllipse ? "Radius X" : "Width"}
            className="text-sm"
            type="number"
            value={w ?? 0}
            onChange={(value) =>
              onChange(isEllipse ? { rx: value } : { width: value })
            }
          />
        </div>
        <div className="flex gap-2 w-full">
          <Label
            className="text-sm"
            htmlFor="input-height"
            title={isEllipse ? "Radius Y" : "Height"}
          >
            {isEllipse ? "RY" : "H"}
          </Label>
          <NumberField
            id="input-height"
            title={isEllipse ? "Radius Y" : "Height"}
            className="text-sm"
            type="number"
            value={h ?? 0}
            onChange={(value) =>
              onChange(isEllipse ? { ry: value } : { height: value })
            }
          />
        </div>
      </div>
      {shape.type === ShapeType.ELLIPSE &&
        (!odd(shape.width) || !odd(shape.height)) && (
          <div className="text-xs bg-neutral-700 px-3 py-2">
            ⚠ Ellipse with even width or height may not render correctly in
            u8g2.
          </div>
        )}
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
        <Label className="text-sm w-16" htmlFor="input-name" title="Fill">
          Fill
        </Label>
        <div className="flex gap-2 w-full">
          <Checkbox
            title="Fill"
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
        <Label className="text-sm w-16" htmlFor="input-name" title="Closed">
          Closed
        </Label>
        <div className="flex gap-2 w-full">
          <Checkbox
            title="Closed"
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
            title="Black"
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
            title="White"
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
            title="XOR"
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

  const directions = [
    { label: "0°", value: 0 },
    { label: "90°", value: 1 },
    { label: "180°", value: 2 },
    { label: "270°", value: 3 },
  ];

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 w-full">
        <Label className="text-sm w-16" htmlFor="input-text" title="Font">
          Font
        </Label>
        <Select
          items={items}
          value={(shape as TextShape).font ?? ""}
          onValueChange={(value) => onChange({ font: value ?? "" })}
        >
          <SelectTrigger className="w-full" title="Font">
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
        <Label className="text-sm w-16" htmlFor="input-text" title="Text">
          Text
        </Label>
        <TextField
          id="input-text"
          title="Text"
          className="text-sm"
          value={(shape as TextShape).text ?? ""}
          onChange={(value) => onChange({ text: value })}
        />
      </div>
      <div className="flex items-center gap-2 w-full">
        <Label className="text-sm w-40" htmlFor="input-text" title="Direction">
          Direction
        </Label>
        <Select
          items={directions}
          value={(shape as TextShape).direction ?? 0}
          onValueChange={(value) => onChange({ direction: value ?? 0 })}
        >
          <SelectTrigger className="w-full" title="Direction">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {directions.map((item) => (
                <SelectItem key={String(item.value)} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const PropertiesPanel: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
  className,
}) => {
  const shape = selection.length === 1 ? selection[0] : null;

  return (
    <div className={cn("absolute inset-0 flex flex-col", className)}>
      <div className="flex h-10 shrink-0 items-center px-4 text-sm">Scene</div>
      <div className="min-h-0 flex-1">
        <ScrollArea className="w-full h-full">
          <div className="flex flex-col gap-3 px-4 pb-4">
            <SceneEdit />
            <div className="mt-1 border-t-[1.5px] border-neutral-800 pt-3 text-sm">
              Shape
            </div>
            {shape ? (
              <div className="flex flex-col gap-3">
                <NameEdit selection={selection} onChange={onChange} />
                <PositionEdit selection={selection} onChange={onChange} />
                <SizeEdit selection={selection} onChange={onChange} />
                <ColorEdit selection={selection} onChange={onChange} />
                <FillEdit selection={selection} onChange={onChange} />
                <ClosedEdit selection={selection} onChange={onChange} />
                <TextEdit selection={selection} onChange={onChange} />
              </div>
            ) : (
              <div className="text-xs text-muted-foreground/60">
                {selection.length > 1
                  ? "Multiple shapes selected"
                  : "No shape selected"}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
