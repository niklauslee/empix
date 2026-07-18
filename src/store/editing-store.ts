import type { Shape, ShapeProps } from "@/components/editor/shapes";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface EditingState {
  actionSequence: number;
  scale: number;
  selection: Shape[];
  activeHandler: string | null;
  activeHandlerLock: boolean;
  increaseActionSequence: () => void;
  setScale: (scale: number) => void;
  setSelection: (selections: Shape[]) => void;
  setActiveHandler: (handlerId: string | null) => void;
  setActiveHandlerLock: (lock: boolean) => void;
}

export const useEditingStore = create<EditingState>()(
  devtools(
    (set) => ({
      actionSequence: 0,
      scale: 1,
      selection: [],
      activeHandler: null,
      activeHandlerLock: false,
      increaseActionSequence: () =>
        set((state) => ({ actionSequence: state.actionSequence + 1 })),
      setScale: (scale) => set((state) => ({ scale })),
      setSelection: (selections) => set((state) => ({ selection: selections })),
      setActiveHandler: (handlerId) =>
        set((state) => ({ activeHandler: handlerId })),
      setActiveHandlerLock: (lock) =>
        set((state) => ({ activeHandlerLock: lock })),
    }),
    { name: "EditingStore" },
  ),
);
