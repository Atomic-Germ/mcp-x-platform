// good-patterns.js - Memory-efficient code

// Pattern 1: Proper cleanup
class EventManagerGood {
  constructor() {
    this.listeners = new Map();
  }

  addListener(element, event, callback) {
    element.addEventListener(event, callback);

    if (!this.listeners.has(element)) {
      this.listeners.set(element, []);
    }
    this.listeners.get(element).push({ event, callback });
  }

  // Proper cleanup
  removeAllListeners(element) {
    const listeners = this.listeners.get(element);
    if (listeners) {
      listeners.forEach(({ event, callback }) => {
        element.removeEventListener(event, callback);
      });
      this.listeners.delete(element);
    }
  }
}

// Pattern 2: Efficient string building
function buildStringEfficient(items) {
  const parts = [];

  for (let i = 0; i < items.length; i++) {
    parts.push(items[i].toString());
  }

  return parts.join('\n');
}

// Pattern 3: Object pooling
class ObjectPool {
  constructor() {
    this.pool = [];
  }

  acquire() {
    return this.pool.pop() || this.create();
  }

  release(obj) {
    this.reset(obj);
    this.pool.push(obj);
  }

  create() {
    return { data: null };
  }

  reset(obj) {
    obj.data = null;
  }
}

module.exports = {
  EventManagerGood,
  buildStringEfficient,
  ObjectPool,
};
