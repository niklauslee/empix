import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { type Project, type Scene } from "@/engine/project-manager";

export interface ProjectState {
  project: Project | null;
  currentScene: Scene | null;
  setProject: (project: Project) => void;
  setCurrentScene: (page: Scene) => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      project: null as Project | null,
      currentScene: null as Scene | null,
      setProject: (project) => set((state) => ({ project })),
      setCurrentScene: (scene) => set((state) => ({ currentScene: scene })),
    }),
    { name: "ProjectStore" },
  ),
);
