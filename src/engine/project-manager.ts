import type { Shape } from "@/components/editor/shapes";
import { generateNewName } from "@/lib/utils";
import { nanoid } from "nanoid";
import { TypedEvent } from "@/components/editor/std";

/**
 * Scene type
 */
export interface Scene {
  id: string;
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
  /**
   * The current project.
   */
  project: Project;

  /**
   * Event that is emitted when the project changes.
   */
  onChange: TypedEvent<Project>;

  constructor() {
    this.project = {
      name: "Project1",
      scenes: [
        {
          id: nanoid(),
          name: "Scene1",
          shapes: [],
        },
      ],
    };
    this.onChange = new TypedEvent<Project>();
  }

  /**
   * Adds a new scene to the project and returns it.
   */
  addScene(): Scene {
    const scene: Scene = {
      id: nanoid(),
      name: generateNewName(
        "Scene",
        this.project.scenes.map((s) => s.name),
      ),
      shapes: [],
    };
    this.project.scenes.push(scene);
    this.onChange.emit(this.project);
    return scene;
  }

  /**
   * Removes a scene from the project.
   */
  removeScene(scene: Scene): void {
    const index = this.project.scenes.indexOf(scene);
    if (index !== -1) {
      this.project.scenes.splice(index, 1);
    }
    this.onChange.emit(this.project);
  }
}
