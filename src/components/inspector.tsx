import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Shape, ShapeProps } from "./editor/shapes";
import { useState } from "react";
import { TextField } from "./ui/text-field";
import { NumberField } from "./ui/number-field";

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

export const Inspector: React.FC<ShapeEditorProps> = ({
  selection,
  onChange,
}) => {
  return (
    <div className="w-full h-full px-4 py-2">
      <div className="text-sm">Properties</div>
      <div className="flex flex-col gap-2 mt-2">
        {selection.length === 1 && (
          <>
            <NameEdit selection={selection} onChange={onChange} />
            <PositionEdit selection={selection} onChange={onChange} />
          </>
        )}
      </div>
    </div>
  );
};
