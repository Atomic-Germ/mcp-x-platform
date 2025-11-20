// Test fixture: Example with slow nested loops
function processData(data) {
  const result = [];

  // Nested loops - O(n^3) complexity
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      for (let k = 0; k < data.length; k++) {
        result.push(data[i] + data[j] + data[k]);
      }
    }
  }

  return result;
}

// Inefficient array operations
function filterAndMap(items) {
  // Multiple iterations over same array
  const filtered = items.filter((x) => x > 0);
  const doubled = filtered.map((x) => x * 2);
  const sorted = doubled.sort((a, b) => a - b);
  return sorted;
}

module.exports = { processData, filterAndMap };
