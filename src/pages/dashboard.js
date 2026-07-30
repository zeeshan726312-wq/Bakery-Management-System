// src/pages/dashboard.js – Dashboard / Home page

export function render() {
  const customers = JSON.parse(localStorage.getItem('bms_customers') || '[]');
  const products  = JSON.parse(localStorage.getItem('bms_products')  || '[]');
  const orders    = JSON.parse(localStorage.getItem('bms_orders')    || '[]');
  const revenue   = orders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);
  const recentOrders = orders.slice(-5).reverse();

  return `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Welcome to Bakery Management System</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card delay-1">
        <div class="stat-icon">👥</div>
        <div class="stat-number">${customers.length}</div>
        <div class="stat-label">Total Customers</div>
      </div>
      <div class="stat-card delay-2">
        <div class="stat-icon">📦</div>
        <div class="stat-number">${orders.length}</div>
        <div class="stat-label">Total Orders</div>
      </div>
      <div class="stat-card delay-3">
        <div class="stat-icon">🧁</div>
        <div class="stat-number">${products.length}</div>
        <div class="stat-label">Total Products</div>
      </div>
      <div class="stat-card delay-4">
        <div class="stat-icon">💰</div>
        <div class="stat-number">₹${revenue.toLocaleString()}</div>
        <div class="stat-label">Total Revenue</div>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title">Recent Orders</h3>
      ${recentOrders.length ? `
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr><th>#</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              ${recentOrders.map((o, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${o.customerName || '—'}</td>
                  <td>${o.productName || '—'}</td>
                  <td>₹${parseFloat(o.amount).toLocaleString()}</td>
                  <td><span class="badge ${o.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
                  <td>${o.date || '—'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>` : `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>No orders yet. Start by adding customers and products!</p>
        </div>`}
    </div>

    <div class="card">
      <h3 class="section-title">Quick Actions</h3>
      <div class="quick-actions">
        <a href="#customers" class="btn btn-primary">👥 Add Customer</a>
        <a href="#products"  class="btn btn-primary">🧁 Add Product</a>
        <a href="#orders"    class="btn btn-success">📦 New Order</a>
        <a href="#suppliers" class="btn btn-outline">🏭 Add Supplier</a>
      </div>
    </div>
  `;
}

export function init() { /* static page, nothing to bind */ }
