import { type Shape } from "./shapes";
import { Stack } from "./std";
import {
  MutationKind,
  type AssignMutation,
  type DeleteMutation,
  type InsertMutation,
  type Mutation,
  type ReorderMutation,
} from "./transform";

const MAX_HISTORY_SIZE = 100;

interface Action {
  id: string;
  mutations: Mutation[];
}

/**
 * Store object that manages the shapes and their mutations.
 */
export class Store {
  /**
   * The list of shapes in the store.
   */
  shapes: Shape[];

  /**
   * The current action being performed.
   */
  currentAction: Action | null;

  /**
   * The undo history.
   */
  undoHistory: Stack<Action>;

  /**
   * The redo history.
   */
  redoHistory: Stack<Action>;

  constructor() {
    this.shapes = [];
    this.currentAction = null;
    this.undoHistory = new Stack<Action>(MAX_HISTORY_SIZE);
    this.redoHistory = new Stack<Action>(MAX_HISTORY_SIZE);
  }

  /**
   * Gets a shape by its Id.
   */
  getShapeById(shapeId: string) {
    return this.shapes.find((shape) => shape.id === shapeId);
  }

  /**
   * Applies a mutation to the store.
   */
  apply(mutation: Mutation) {
    switch (mutation.kind) {
      case MutationKind.ACTION_BEGIN: {
        this.currentAction = { id: mutation.actionId, mutations: [] };
        break;
      }
      case MutationKind.ACTION_END: {
        if (this.currentAction) {
          this.undoHistory.push(this.currentAction);
          this.currentAction = null;
        }
        break;
      }
      case MutationKind.ACTION_CANCEL: {
        if (this.currentAction) {
          for (let i = this.currentAction.mutations.length - 1; i >= 0; i--) {
            this.unapply(this.currentAction.mutations[i]);
          }
          this.currentAction = null;
        }
        break;
      }
      case MutationKind.ASSIGN: {
        const { shapeId, field, newValue } = mutation as AssignMutation;
        const shape = this.getShapeById(shapeId);
        if (!shape) {
          throw new Error(`Shape with ID ${shapeId} not found.`);
        }
        (shape as any)[field] = newValue; // Update the shape's field
        break;
      }
      case MutationKind.INSERT: {
        const { shapeId, data, position } = mutation as InsertMutation;
        const shape = structuredClone(data) as Shape;
        shape.id = shapeId; // Ensure the shape has the correct ID
        if (position < 0 || position > this.shapes.length) {
          this.shapes.push(shape); // append to end
        } else {
          this.shapes.splice(position, 0, shape); // insert at the position
        }
        break;
      }
      case MutationKind.DELETE: {
        const { shapeId } = mutation as DeleteMutation;
        const index = this.shapes.findIndex((shape) => shape.id === shapeId);
        if (index !== -1) {
          this.shapes.splice(index, 1); // Remove the shape
        }
        break;
      }
      case MutationKind.REORDER: {
        const { shapeId, oldIndex, newIndex } = mutation as ReorderMutation;
        const shape = this.getShapeById(shapeId);
        if (!shape) {
          throw new Error(`Shape with ID ${shapeId} not found.`);
        }
        this.shapes.splice(oldIndex, 1);
        this.shapes.splice(newIndex, 0, shape);
        break;
      }
    }
  }

  /**
   * Unapplies a mutation from the store.
   */
  unapply(mutation: Mutation) {
    switch (mutation.kind) {
      case MutationKind.ACTION_BEGIN:
      case MutationKind.ACTION_END:
      case MutationKind.ACTION_CANCEL:
        // No action needed for these mutations when unapplying
        break;
      case MutationKind.ASSIGN: {
        const { shapeId, field, oldValue } = mutation as AssignMutation;
        const shape = this.getShapeById(shapeId);
        if (!shape) {
          throw new Error(`Shape with ID ${shapeId} not found.`);
        }
        (shape as any)[field] = oldValue; // Revert the shape's field
        break;
      }
      case MutationKind.INSERT: {
        const { shapeId } = mutation as InsertMutation;
        const index = this.shapes.findIndex((shape) => shape.id === shapeId);
        if (index !== -1) {
          this.shapes.splice(index, 1); // Remove the shape
        }
        break;
      }
      case MutationKind.DELETE: {
        const { shapeId, data, position } = mutation as DeleteMutation;
        const shape = structuredClone(data) as Shape;
        shape.id = shapeId; // Ensure the shape has the correct ID
        if (position < 0 || position > this.shapes.length) {
          this.shapes.push(shape); // append to end
        } else {
          this.shapes.splice(position, 0, shape); // insert at the position
        }
        break;
      }
      case MutationKind.REORDER: {
        const { shapeId, oldIndex, newIndex } = mutation as ReorderMutation;
        const shape = this.getShapeById(shapeId);
        if (!shape) {
          throw new Error(`Shape with ID ${shapeId} not found.`);
        }
        this.shapes.splice(newIndex, 1); // Remove from new position
        this.shapes.splice(oldIndex, 0, shape); // Insert back to old position
        break;
      }
    }
  }

  /**
   * Appends a mutation to the current action.
   */
  appendToAction(mutation: Mutation) {
    if (!this.currentAction) {
      throw new Error("No active action. Call begin() first.");
    }
    this.currentAction.mutations.push(mutation);
  }

  /**
   * Undo the last action.
   */
  undo() {
    if (this.undoHistory.size() === 0) return;
    const action = this.undoHistory.pop()!;
    for (let i = action.mutations.length - 1; i >= 0; i--) {
      this.unapply(action.mutations[i]);
    }
    this.redoHistory.push(action);
  }

  /**
   * Redo the last undone action.
   */
  redo() {
    if (this.redoHistory.size() === 0) return;
    const action = this.redoHistory.pop()!;
    for (const mutation of action.mutations) {
      this.apply(mutation);
    }
    this.undoHistory.push(action);
  }

  /**
   * Clears the store, removing all shapes and resetting history.
   */
  clear() {
    this.shapes = [];
    this.currentAction = null;
    this.undoHistory.clear();
    this.redoHistory.clear();
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
      this.currentAction = null;
      this.undoHistory.clear();
      this.redoHistory.clear();
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
