import { type Shape } from "./shapes";

/**
 * Store object that manages the shapes and their mutations.
 */
export class Store {
  /**
   * The list of shapes in the store.
   */
  shapes: Shape[];

  constructor() {
    this.shapes = [];
  }

  /**
   * Clears the store, removing all shapes and resetting history.
   */
  clear() {
    this.shapes = [];
  }

  /**
   * Sets the shapes in the store.
   */
  setShapes(shapes: Shape[]) {
    this.shapes = shapes;
  }

  /**
   * Gets a shape by its Id.
   */
  getShapeById(shapeId: string) {
    return this.shapes.find((shape) => shape.id === shapeId);
  }

  /**
   * Loads the store from JSON
   */
  fromJSON(json: any) {
    try {
      if (!Array.isArray(json)) {
        throw new Error("Invalid JSON format: Expected an array of shapes.");
      }
      this.shapes = json;
    } catch (error) {
      console.error("Failed to load store from JSON:", error);
    }
  }

  /**
   * Saves the store to JSON
   */
  toJSON() {
    return structuredClone(this.shapes);
  }
}
