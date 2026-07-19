import { nanoid } from "nanoid";
import { type Shape } from "./shapes";
import { TypedEvent, Stack } from "./std";
import { Store } from "./store";

const MAX_HISTORY_SIZE = 100;

/**
 * Mutation kinds for shape transformations
 */
export const MutationKind = {
  ACTION_BEGIN: "begin",
  ACTION_END: "end",
  ACTION_CANCEL: "cancel",
  ASSIGN: "assign",
  INSERT: "insert",
  DELETE: "delete",
  REORDER: "reorder",
} as const;

/**
 * Mutation type
 */
export interface Mutation {
  actionId: string;
  kind: string;
}

/**
 * Assign mutation type
 */
export interface AssignMutation extends Mutation {
  kind: typeof MutationKind.ASSIGN;
  shapeId: string;
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * Insert mutation type
 */
export interface InsertMutation extends Mutation {
  kind: typeof MutationKind.INSERT;
  shapeId: string;
  data: any;
  position: number;
}

/**
 * Delete mutation type
 */
export interface DeleteMutation extends Mutation {
  kind: typeof MutationKind.DELETE;
  shapeId: string;
  data: any;
  position: number;
}

/**
 * Reorder mutation type
 */
export interface ReorderMutation extends Mutation {
  kind: typeof MutationKind.REORDER;
  shapeId: string;
  oldIndex: number;
  newIndex: number;
}

/**
 * Action type for grouping mutations
 */
interface Action {
  id: string;
  mutations: Mutation[];
}

/**
 * Transform for mutating shapes.
 */
export class Transform {
  /**
   * The shape store.
   */
  store: Store;

  /**
   * The id of the current action.
   */
  actionId: string | null;

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

  /**
   * The event emitter for mutation events.
   */
  onMutation: TypedEvent<Mutation>;

  /**
   * The event emitter for action events.
   */
  onAction: TypedEvent<Action>;

  /**
   * The event emitter for undo events.
   */
  onUndo: TypedEvent<Action>;

  /**
   * The event emitter for redo events.
   */
  onRedo: TypedEvent<Action>;

  constructor(store: Store) {
    this.store = store;
    this.actionId = null;
    this.currentAction = null;
    this.undoHistory = new Stack<Action>(MAX_HISTORY_SIZE);
    this.redoHistory = new Stack<Action>(MAX_HISTORY_SIZE);
    this.onMutation = new TypedEvent<Mutation>();
    this.onAction = new TypedEvent<Action>();
    this.onUndo = new TypedEvent<Action>();
    this.onRedo = new TypedEvent<Action>();
  }

  /**
   * Clears the current action and history.
   */
  clear() {
    this.currentAction = null;
    this.undoHistory.clear();
    this.redoHistory.clear();
  }

  /**
   * Triggers a mutation event.
   */
  trigger(mutation: Mutation) {
    console.log("[onMutation]", mutation);
    this.onMutation.emit(mutation);
  }

  /**
   * Begins a new action.
   */
  begin() {
    this.actionId = nanoid();
    const mut: Mutation = {
      actionId: this.actionId,
      kind: MutationKind.ACTION_BEGIN,
    };
    this.apply(mut);
    this.trigger(mut);
  }

  /**
   * Ends the current action.
   */
  end() {
    if (!this.actionId) {
      throw new Error("No active action. Call begin() first.");
    }
    const mut: Mutation = {
      actionId: this.actionId,
      kind: MutationKind.ACTION_END,
    };
    this.apply(mut);
    this.trigger(mut);
    this.actionId = null;
  }

  /**
   * Cancels the current action.
   */
  cancel() {
    if (!this.actionId) {
      throw new Error("No active action. Call begin() first.");
    }
    const mut: Mutation = {
      actionId: this.actionId,
      kind: MutationKind.ACTION_CANCEL,
    };
    this.apply(mut);
    this.trigger(mut);
    this.actionId = null;
  }

  /**
   * Assigns a new value to a shape's field.
   */
  assign(shape: Shape, field: string, value: any) {
    if (!this.actionId) {
      throw new Error("No active action. Call begin() first.");
    }
    const old = JSON.stringify((shape as any)[field]);
    const val = JSON.stringify(value);
    if (old === val) return false;
    const mut: AssignMutation = {
      actionId: this.actionId as string,
      kind: MutationKind.ASSIGN,
      shapeId: shape.id,
      field,
      oldValue: (shape as any)[field],
      newValue: structuredClone(value),
    };
    this.apply(mut);
    this.appendToAction(mut);
    this.trigger(mut);
    return mut;
  }

  /**
   * Inserts a new shape into the store.
   */
  insert(shape: Shape, position: number = -1) {
    if (!this.actionId) {
      throw new Error("No active action. Call begin() first.");
    }
    const existingShape = this.store.getShapeById(shape.id);
    if (existingShape) {
      throw new Error(`Shape with id ${shape.id} already exists.`);
    }
    const mut: InsertMutation = {
      actionId: this.actionId as string,
      kind: MutationKind.INSERT,
      shapeId: shape.id,
      data: structuredClone(shape),
      position,
    };
    this.apply(mut);
    this.appendToAction(mut);
    this.trigger(mut);
  }

  /**
   * Deletes a shape from the store.
   */
  delete(shape: Shape) {
    if (!this.actionId) {
      throw new Error("No active action. Call begin() first.");
    }
    const mut: DeleteMutation = {
      actionId: this.actionId as string,
      kind: MutationKind.DELETE,
      shapeId: shape.id,
      data: structuredClone(shape),
      position: this.store.shapes.findIndex((s) => s.id === shape.id),
    };
    this.apply(mut);
    this.appendToAction(mut);
    this.trigger(mut);
  }

  /**
   * Reorders a shape in the store.
   */
  reorder(shape: Shape, newPosition: number) {
    if (!this.actionId) {
      throw new Error("No active action. Call begin() first.");
    }
    const oldPosition = this.store.shapes.findIndex((s) => s.id === shape.id);
    if (oldPosition === -1) {
      throw new Error(`Shape with id ${shape.id} not found.`);
    }
    if (oldPosition === newPosition) {
      return; // No change in position
    }
    const mut: ReorderMutation = {
      actionId: this.actionId as string,
      kind: MutationKind.REORDER,
      shapeId: shape.id,
      oldIndex: oldPosition,
      newIndex: newPosition,
    };
    this.apply(mut);
    this.appendToAction(mut);
    this.trigger(mut);
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
        if (this.currentAction && this.currentAction.mutations.length > 0) {
          this.undoHistory.push(this.currentAction);
          this.onAction.emit(this.currentAction);
        }
        this.currentAction = null;
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
        const shape = this.store.getShapeById(shapeId);
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
        if (position < 0 || position > this.store.shapes.length) {
          this.store.shapes.push(shape); // append to end
        } else {
          this.store.shapes.splice(position, 0, shape); // insert at the position
        }
        break;
      }
      case MutationKind.DELETE: {
        const { shapeId } = mutation as DeleteMutation;
        const index = this.store.shapes.findIndex(
          (shape) => shape.id === shapeId,
        );
        if (index !== -1) {
          this.store.shapes.splice(index, 1); // Remove the shape
        }
        break;
      }
      case MutationKind.REORDER: {
        const { shapeId, oldIndex, newIndex } = mutation as ReorderMutation;
        const shape = this.store.getShapeById(shapeId);
        if (!shape) {
          throw new Error(`Shape with ID ${shapeId} not found.`);
        }
        this.store.shapes.splice(oldIndex, 1);
        this.store.shapes.splice(newIndex, 0, shape);
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
        const shape = this.store.getShapeById(shapeId);
        if (!shape) {
          throw new Error(`Shape with ID ${shapeId} not found.`);
        }
        (shape as any)[field] = oldValue; // Revert the shape's field
        break;
      }
      case MutationKind.INSERT: {
        const { shapeId } = mutation as InsertMutation;
        const index = this.store.shapes.findIndex(
          (shape) => shape.id === shapeId,
        );
        if (index !== -1) {
          this.store.shapes.splice(index, 1); // Remove the shape
        }
        break;
      }
      case MutationKind.DELETE: {
        const { shapeId, data, position } = mutation as DeleteMutation;
        const shape = structuredClone(data) as Shape;
        shape.id = shapeId; // Ensure the shape has the correct ID
        if (position < 0 || position > this.store.shapes.length) {
          this.store.shapes.push(shape); // append to end
        } else {
          this.store.shapes.splice(position, 0, shape); // insert at the position
        }
        break;
      }
      case MutationKind.REORDER: {
        const { shapeId, oldIndex, newIndex } = mutation as ReorderMutation;
        const shape = this.store.getShapeById(shapeId);
        if (!shape) {
          throw new Error(`Shape with ID ${shapeId} not found.`);
        }
        this.store.shapes.splice(newIndex, 1); // Remove from new position
        this.store.shapes.splice(oldIndex, 0, shape); // Insert back to old position
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
    this.onUndo.emit(action);
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
    this.onRedo.emit(action);
  }
}
