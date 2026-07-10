/**
 * From TypeScript Deep Dive
 * https://basarat.gitbook.io/typescript/main-1/typed-event
 */

export interface Listener<T> {
  (event: T): any;
}

export interface Disposable {
  dispose(): void;
}

/** passes through events as they happen. You will not get events from before you start listening */
export class TypedEvent<T> {
  private listeners: Listener<T>[] = [];
  private listenersOncer: Listener<T>[] = [];

  addListener = (listener: Listener<T>): Disposable => {
    this.listeners.push(listener);
    return {
      dispose: () => this.removeListener(listener),
    };
  };

  addOnceListener = (listener: Listener<T>): void => {
    this.listenersOncer.push(listener);
  };

  removeListener = (listener: Listener<T>) => {
    const callbackIndex = this.listeners.indexOf(listener);
    if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
  };

  hasListeners = (): boolean => {
    return this.listeners.length > 0 || this.listenersOncer.length > 0;
  };

  emit = (event: T) => {
    /** Update any general listeners */
    this.listeners.forEach((listener) => listener(event));

    /** Clear the `once` queue */
    if (this.listenersOncer.length > 0) {
      const toCall = this.listenersOncer;
      this.listenersOncer = [];
      toCall.forEach((listener) => listener(event));
    }
  };

  pipe = (te: TypedEvent<T>): Disposable => {
    return this.addListener((e) => te.emit(e));
  };
}

/**
 * A size-limited stack.
 * Delete the last inserted item if overflow.
 */
export class Stack<T> {
  maxSize: number;
  stack: T[];

  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.stack = [];
  }

  /**
   * Clear stack.
   */
  clear() {
    this.stack = [];
  }

  /**
   * Push an item
   */
  push(item: T) {
    this.stack.push(item);
    if (this.stack.length > this.maxSize) {
      this.stack.splice(0, 1);
    }
  }

  /**
   * Pop an item from the top
   */
  pop(): T | undefined {
    return this.stack.pop();
  }

  /**
   * Get the n-th item from the top (immutable)
   */
  get(n: number = 0): T | undefined {
    return this.stack[this.stack.length - 1 - n];
  }

  /**
   * Return size of stack
   */
  size(): number {
    return this.stack.length;
  }
}
