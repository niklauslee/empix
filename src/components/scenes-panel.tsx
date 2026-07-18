import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Shape, ShapeProps } from "./editor/shapes";
import { useState } from "react";
import { TextField } from "./ui/text-field";
import { NumberField } from "./ui/number-field";
import { ScrollArea } from "./ui/scroll-area";
import { useProjectStore } from "@/store/project-store";
import type { Scene } from "@/engine/project-manager";
import { Button } from "./ui/button";
import { PlusIcon, MinusIcon } from "./icons";

export interface ScenesPanelProps {}

export const SceneCard: React.FC<{
  scene: Scene;
}> = ({ scene }) => {
  return (
    <div>
      <div className="w-40 h-24 bg-slate-800 border"></div>
      <div className="text-sm">{scene.name}</div>
    </div>
  );
};

export const ScenesPanel: React.FC<ScenesPanelProps> = ({}) => {
  const project = useProjectStore((state) => state.project);
  const scenes = project?.scenes ?? [];

  const handleAddScene = () => {
    const app = window.app;
    app.projectManager.addScene();
  };

  return (
    <ScrollArea className="w-full h-full">
      <div className="w-full h-full px-4 py-2">
        <div className="text-sm leading-0 my-4">Scenes | Layers</div>
        <div className="text-sm leading-0 my-4">
          <Button variant="outline" size="icon" onClick={handleAddScene}>
            <PlusIcon size={12} />
          </Button>
          <Button variant="outline" size="icon">
            <MinusIcon size={12} />
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {scenes.map((scene) => (
            <SceneCard key={scene.id} scene={scene} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
