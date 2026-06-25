/**
 * Generic Stack ADT (array-backed), used to drive Undo/Redo in the editor.
 * push/pop/peek are all O(1).
 */
class Stack {
  constructor() {
    this._items = [];
  }

  push(item) {
    this._items.push(item);
  }

  pop() {
    return this._items.pop();
  }

  peek() {
    return this._items[this._items.length - 1];
  }

  isEmpty() {
    return this._items.length === 0;
  }

  get size() {
    return this._items.length;
  }

  clear() {
    this._items = [];
  }

  /** Returns items top-first, without mutating the stack. */
  toArray() {
    return this._items.slice().reverse();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Stack;
}
