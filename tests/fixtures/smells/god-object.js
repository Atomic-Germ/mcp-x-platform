// god-object.js - God Object anti-pattern

class UserManager {
  constructor() {
    this.users = [];
    this.products = [];
    this.orders = [];
    this.payments = [];
    this.notifications = [];
    this.analytics = {};
    this.cache = {};
    this.config = {};
  }

  // User management (should be separate)
  createUser(name, email, password, age, address, phone) {
    const user = { name, email, password, age, address, phone };
    this.users.push(user);
    this.sendWelcomeEmail(email);
    this.trackAnalytics('user_created');
    return user;
  }

  updateUser(id, name, email, password, age, address, phone) {
    const user = this.users.find((u) => u.id === id);
    if (user) {
      user.name = name;
      user.email = email;
      user.password = password;
      user.age = age;
      user.address = address;
      user.phone = phone;
    }
  }

  deleteUser(id) {
    this.users = this.users.filter((u) => u.id !== id);
  }

  // Product management (should be separate)
  createProduct(name, price, description, category, stock, sku) {
    const product = { name, price, description, category, stock, sku };
    this.products.push(product);
    return product;
  }

  updateProduct(id, name, price, description, category, stock, sku) {
    const product = this.products.find((p) => p.id === id);
    if (product) {
      product.name = name;
      product.price = price;
      product.description = description;
      product.category = category;
      product.stock = stock;
      product.sku = sku;
    }
  }

  // Order management (should be separate)
  createOrder(userId, productId, quantity, shippingAddress, paymentMethod) {
    const order = { userId, productId, quantity, shippingAddress, paymentMethod };
    this.orders.push(order);
    this.processPayment(paymentMethod, quantity);
    this.sendOrderConfirmation(userId);
    return order;
  }

  // Payment processing (should be separate)
  processPayment(method, amount) {
    this.payments.push({ method, amount, timestamp: new Date() });
  }

  // Notifications (should be separate)
  sendWelcomeEmail(email) {
    this.notifications.push({ type: 'welcome', to: email });
  }

  sendOrderConfirmation(userId) {
    this.notifications.push({ type: 'order', userId });
  }

  // Analytics (should be separate)
  trackAnalytics(event) {
    if (!this.analytics[event]) {
      this.analytics[event] = 0;
    }
    this.analytics[event]++;
  }

  // Too many responsibilities!
}

module.exports = { UserManager };
