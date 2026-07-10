import { nanoid } from "nanoid";
import { type Shape } from "./shapes";
import { TypedEvent } from "./std";
import { Store } from "./store";

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
   * The event emitter for mutation events.
   */
  onMutation: TypedEvent<Mutation>;

  constructor(store: Store) {
    this.store = store;
    this.actionId = null;
    this.onMutation = new TypedEvent<Mutation>();
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
    this.store.apply(mut);
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
    this.store.apply(mut);
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
    this.store.apply(mut);
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
    this.store.apply(mut);
    this.store.appendToAction(mut);
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
    this.store.apply(mut);
    this.store.appendToAction(mut);
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
    this.store.apply(mut);
    this.store.appendToAction(mut);
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
    this.store.apply(mut);
    this.store.appendToAction(mut);
    this.trigger(mut);
  }
}
