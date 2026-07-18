import { Input } from "./ui/input";
import { useEditingStore } from "@/store/editing-store";
import { Label } from "./ui/label";

export function NameEdit() {
  const selection = useEditingStore((state) => state.selection);
  const shape = selection[0];
  return (
    <div>
      <div className="flex gap-2 w-full">
        <Label className="text-sm" htmlFor="input-name">
          Name
        </Label>
        <Input
          id="input-name"
          className="text-sm"
          value={shape?.name ?? "Shape 1"}
        />
      </div>
    </div>
  );
}

export function PositionEdit() {
  const selection = useEditingStore((state) => state.selection);
  const shape = selection[0];
  return (
    <div className="flex w-full gap-4">
      <div className="flex gap-2 w-full">
        <Label className="text-sm" htmlFor="input-x">
          X
        </Label>
        <Input
          id="input-x"
          className="text-sm"
          type="number"
          value={shape?.left ?? 0}
        />
      </div>
      <div className="flex gap-2 w-full">
        <Label className="text-sm" htmlFor="input-y">
          Y
        </Label>
        <Input
          id="input-y"
          className="text-sm"
          type="number"
          value={shape?.top ?? 0}
        />
      </div>
    </div>
  );
}

export function Inspector() {
  const selection = useEditingStore((state) => state.selection);

  return (
    <div className="w-full h-full px-4 py-2">
      <div className="text-sm">Properties</div>
      <div className="flex flex-col gap-2 mt-2">
        {selection.length === 1 && (
          <>
            <NameEdit />
            <PositionEdit />
          </>
        )}
      </div>
    </div>
  );
}
