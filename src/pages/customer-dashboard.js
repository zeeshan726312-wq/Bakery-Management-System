// src/pages/customer-dashboard.js – Customer's home view

export function render() {
  const orders = JSON.parse(localStorage.getItem('bms_orders') || '[]');
  const myOrders = orders.filter(o => o.placedBy === 'customer');
  const complaints = JSON.parse(localStorage.getItem('bms_complaints') || '[]');
  const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
  const pendingCount = myOrders.filter(o => o.status === 'Pending').length;
  const confirmedCount = myOrders.filter(o => o.status === 'Confirmed').length;

  return `
    <div class="page-header">
      <h1 class="page-title">Welcome, Customer!</h1>
      <p class="page-subtitle">Your bakery ordering dashboard</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card delay-1">
        <div class="stat-icon">🧁</div>
        <div class="stat-number">${products.length}</div>
        <div class="stat-label">Products Available</div>
      </div>
      <div class="stat-card delay-2">
        <div class="stat-icon">📦</div>
        <div class="stat-number">${myOrders.length}</div>
        <div class="stat-label">My Orders</div>
      </div>
      <div class="stat-card delay-3">
        <div class="stat-icon">⏳</div>
        <div class="stat-number">${pendingCount}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-card delay-4">
        <div class="stat-icon">✅</div>
        <div class="stat-number">${confirmedCount}</div>
        <div class="stat-label">Confirmed</div>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title">Quick Actions</h3>
      <div class="quick-actions">
        <a href="#browse-products" class="btn btn-primary">🧁 Browse Products</a>
        <a href="#my-orders" class="btn btn-success">📦 My Orders</a>
        <a href="#complaints" class="btn btn-outline">📝 File Complaint</a>
      </div>
    </div>

    ${myOrders.length ? `
    <div class="card">
      <h3 class="section-title">Recent Orders</h3>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            ${myOrders.slice(-5).reverse().map((o, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${o.productName}</td>
                <td>${o.quantity}</td>
                <td>₹${parseFloat(o.amount).toLocaleString()}</td>
                <td><span class="badge ${o.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
                <td>${o.date}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}

    ${complaints.length ? `
    <div class="card">
      <h3 class="section-title">My Complaints</h3>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>#</th><th>Subject</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            ${complaints.slice(-3).reverse().map((c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${c.subject}</td>
                <td><span class="badge ${c.status === 'Resolved' ? 'badge-success' : 'badge-warning'}">${c.status}</span></td>
                <td>${new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}
  `;
}

export function init() {}
