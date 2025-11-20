// duplication.js - Code duplication anti-patterns

function validateUserEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (email.length < 5) {
    return { valid: false, error: 'Email too short' };
  }
  if (!email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (!email.includes('.')) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
}

// DUPLICATE: Almost identical to above
function validateAdminEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (email.length < 5) {
    return { valid: false, error: 'Email too short' };
  }
  if (!email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (!email.includes('.')) {
    return { valid: false, error: 'Invalid email format' };
  }
  // Only difference
  if (!email.endsWith('@admin.com')) {
    return { valid: false, error: 'Must be admin email' };
  }
  return { valid: true };
}

// DUPLICATE: Similar structure repeated
function processUserData(data) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].active) {
      result.push({
        id: data[i].id,
        name: data[i].name,
        processed: true,
      });
    }
  }
  return result;
}

function processAdminData(data) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].active) {
      result.push({
        id: data[i].id,
        name: data[i].name,
        processed: true,
      });
    }
  }
  return result;
}

// DUPLICATE: Magic numbers repeated
function calculateUserDiscount(total) {
  if (total > 1000) {
    return total * 0.15;
  } else if (total > 500) {
    return total * 0.1;
  } else if (total > 100) {
    return total * 0.05;
  }
  return 0;
}

function calculateVIPDiscount(total) {
  if (total > 1000) {
    return total * 0.15;
  } else if (total > 500) {
    return total * 0.1;
  } else if (total > 100) {
    return total * 0.05;
  }
  return 0;
}

module.exports = {
  validateUserEmail,
  validateAdminEmail,
  processUserData,
  processAdminData,
  calculateUserDiscount,
  calculateVIPDiscount,
};
