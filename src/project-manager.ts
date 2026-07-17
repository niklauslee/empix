import type { Shape } from "@/components/editor/shapes";

/**
 * Scene type
 */
export interface Scene {
  name: string;
  shapes: Shape[];
}

/**
 * Project type
 */
export interface Project {
  name: string;
  scenes: Scene[];
}

/**
 * ProjectManager class
 */
export class ProjectManager {
  project: Project;

  constructor() {
    this.project = {
      name: "",
      scenes: [],
    };
  }
}
