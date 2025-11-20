// inefficient-allocations.js - Memory allocation anti-patterns

// Pattern 1: Large array allocation in loops
function processItems(items) {
  const results = [];

  for (let i = 0; i < items.length; i++) {
    // Creating large temporary array each iteration
    const temp = new Array(10000).fill(0);
    results.push(temp.reduce((a, b) => a + b));
  }

  return results;
}

// Pattern 2: Object allocation in hot loop
function createManyObjects(count) {
  const objects = [];

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      // Heavy object creation in nested loop
      objects.push({
        id: i * count + j,
        data: new Array(100).fill(i),
        metadata: {
          created: new Date(),
          tags: ['tag1', 'tag2', 'tag3'],
        },
      });
    }
  }

  return objects;
}

// Pattern 3: String concatenation (memory churn)
function buildLargeString(items) {
  let result = '';

  for (let i = 0; i < items.length; i++) {
    // Each concatenation creates new string
    result += items[i].toString();
    result += '\n';
  }

  return result;
}

// Pattern 4: Unnecessary array copying
function processArray(arr) {
  let result = [...arr]; // Copy 1

  result = result.map((x) => x * 2); // Copy 2
  result = [...result]; // Copy 3 (unnecessary)
  result = result.filter((x) => x > 0); // Copy 4
  result = [...result]; // Copy 5 (unnecessary)

  return result;
}

// Pattern 5: Buffer allocation without pooling
function processData(chunks) {
  const results = [];

  for (const chunk of chunks) {
    // New Buffer allocation each time
    const buffer = Buffer.alloc(1024 * 1024); // 1MB
    buffer.write(chunk);
    results.push(buffer);
  }

  return results;
}

// Pattern 6: Regex in loop (compiled each time)
function validateMany(strings) {
  const results = [];

  for (const str of strings) {
    // Regex compiled on each iteration
    if (/^[a-z]{3,10}$/.test(str)) {
      results.push(str);
    }
  }

  return results;
}

module.exports = {
  processItems,
  createManyObjects,
  buildLargeString,
  processArray,
  processData,
  validateMany,
};
