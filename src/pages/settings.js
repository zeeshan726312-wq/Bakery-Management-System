// src/pages/settings.js – Settings & data management

export function render() {
  const customers    = JSON.parse(localStorage.getItem('bms_customers')     || '[]');
  const products     = JSON.parse(localStorage.getItem('bms_products')      || '[]');
  const orders       = JSON.parse(localStorage.getItem('bms_orders')        || '[]');
  const suppliers    = JSON.parse(localStorage.getItem('bms_suppliers')     || '[]');
  const deliveries   = JSON.parse(localStorage.getItem('bms_deliveries')    || '[]');
  const supplyOrders = JSON.parse(localStorage.getItem('bms_supply_orders') || '[]');

  return `
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-subtitle">System configuration & data management</p>
    </div>

    <div class="card">
      <h3 class="section-title">🏪 Bakery Information</h3>
      <div class="stats-grid" style="margin-bottom:0;">
        <div class="stat-card">
          <div class="stat-number">${customers.length}</div>
          <div class="stat-label">Customers</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${products.length}</div>
          <div class="stat-label">Products</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${orders.length}</div>
          <div class="stat-label">Orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${suppliers.length}</div>
          <div class="stat-label">Suppliers</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${deliveries.length}</div>
          <div class="stat-label">Deliveries</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${supplyOrders.length}</div>
          <div class="stat-label">Supply Orders</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title">📦 Data Management</h3>
      <p style="color:var(--text-secondary);margin-bottom:1rem;">Export or clear all your bakery data. Exported data is saved as a JSON file.</p>
      <div class="quick-actions">
        <button id="exportBtn" class="btn btn-primary">📥 Export All Data</button>
        <button id="clearBtn" class="btn btn-danger">🗑️ Clear All Data</button>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title">ℹ️ About</h3>
      <p style="color:var(--text-secondary);line-height:1.7;">
        <strong>Bakery Management System</strong> v1.0.0<br/>
        A premium single-page application for managing your bakery business.
        Track customers, products, orders, deliveries, and suppliers — all in one place.<br/><br/>
        Built with ❤️ using Vite, vanilla JavaScript, and modern CSS.
      </p>
    </div>
  `;
}

export function init() {
  // Export
  document.getElementById('exportBtn')?.addEventListener('click', () => {
    const keys = ['bms_customers','bms_products','bms_orders','bms_suppliers','bms_deliveries','bms_supply_orders','bms_theme'];
    const data = {};
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) data[k] = JSON.parse(val);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bakery-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Clear
  document.getElementById('clearBtn')?.addEventListener('click', () => {
    if (!confirm('Are you sure you want to clear ALL bakery data? This cannot be undone.')) return;
    ['bms_customers','bms_products','bms_orders','bms_suppliers','bms_deliveries','bms_supply_orders'].forEach(k => localStorage.removeItem(k));
    // Re-render
    document.getElementById('app').innerHTML = render();
    init();
  });
}
