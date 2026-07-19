import type { Shape, ShapeProps } from "@/components/editor/shapes";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface EditorState {
  actionSequence: number;
  width: number;
  height: number;
  scale: number;
  shapes: Shape[];
  selection: Shape[];
  activeHandler: string | null;
  activeHandlerLock: boolean;
  increaseActionSequence: () => void;
  setScale: (scale: number) => void;
  setSize: (width: number, height: number) => void;
  setShapes: (shapes: Shape[]) => void;
  setSelection: (selections: Shape[]) => void;
  setActiveHandler: (handlerId: string | null) => void;
  setActiveHandlerLock: (lock: boolean) => void;
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set) => ({
      actionSequence: 0,
      width: 0,
      height: 0,
      scale: 1,
      shapes: [],
      selection: [],
      activeHandler: null,
      activeHandlerLock: false,
      increaseActionSequence: () =>
        set((state) => ({ actionSequence: state.actionSequence + 1 })),
      setScale: (scale) => set((state) => ({ scale })),
      setSize: (width, height) => set((state) => ({ width, height })),
      setShapes: (shapes) => set((state) => ({ shapes })),
      setSelection: (selections) => set((state) => ({ selection: selections })),
      setActiveHandler: (handlerId) =>
        set((state) => ({ activeHandler: handlerId })),
      setActiveHandlerLock: (lock) =>
        set((state) => ({ activeHandlerLock: lock })),
    }),
    { name: "EditingStore" },
  ),
);
