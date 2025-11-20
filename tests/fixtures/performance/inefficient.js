// Test fixture: Inefficient patterns
function findDuplicates(arr) {
  const duplicates = [];

  // O(n^2) duplicate detection
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }

  return duplicates;
}

// Inefficient string concatenation in loop
function buildString(items) {
  let result = '';
  for (let i = 0; i < items.length; i++) {
    result += items[i] + ',';
  }
  return result;
}

module.exports = { findDuplicates, buildString };
