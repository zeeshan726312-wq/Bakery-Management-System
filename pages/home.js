// pages/home.js – Home page module
export function render() {
  return `
    <section class="card">
      <h1>Welcome to the Bakery Management System</h1>
      <p>Manage your bakery inventory, orders, and products with a sleek, modern interface.</p>
      <button class="btn" onclick="location.hash='#products'">View Products</button>
    </section>
  `;
}
