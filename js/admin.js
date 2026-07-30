// js/admin.js - Master Admin Console Logic for LaylPur Bakery
import { Store } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  let user = window.getCurrentUser ? window.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.role !== 'admin') {
    user = {
      name: "System Admin",
      email: "admin@laylpurbakery.com",
      role: "admin"
    };
    if (window.Auth && window.Auth.setCurrentUser) {
      window.Auth.setCurrentUser(user);
    } else {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  const userNameEl = document.getElementById('userName');
  const userNameHeaderEl = document.getElementById('userNameHeader');
  if (userNameEl) userNameEl.textContent = user.name;
  if (userNameHeaderEl) userNameHeaderEl.textContent = user.name;

  // Initialize UI
  renderOverviewCards();
  renderUsersTable();
  renderProductsTable();
  renderSalesReport();
  renderDiscountsTable();
  renderFeedbacksTable();
  setupEventListeners();
});

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      
      btn.classList.add('active');
      const target = btn.getAttribute('data-target');
      if (document.getElementById(target)) {
        document.getElementById(target).style.display = 'block';
      }
    });
  });

  // Add User Modal
  const openAddUserBtn = document.getElementById('openAddUserBtn');
  const addUserModal = document.getElementById('addUserModal');
  const closeAddUserBtn = document.getElementById('closeAddUserBtn');

  if (openAddUserBtn && addUserModal) openAddUserBtn.addEventListener('click', () => addUserModal.classList.add('active'));
  if (closeAddUserBtn && addUserModal) closeAddUserBtn.addEventListener('click', () => addUserModal.classList.remove('active'));

  // Add User Form Submission
  const addUserForm = document.getElementById('addUserForm');
  if (addUserForm) {
    addUserForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newUserName').value.trim();
      const email = document.getElementById('newUserEmail').value.trim().toLowerCase();
      const password = document.getElementById('newUserPassword').value;
      const role = document.getElementById('newUserRole').value;

      const users = (window.Auth && window.Auth.getUsers) ? window.Auth.getUsers() : JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.email.toLowerCase() === email)) {
        if (window.Auth && window.Auth.showToast) window.Auth.showToast('User email already exists.', 'error');
        return;
      }

      users.push({ name, email, password, role });
      if (window.Auth && window.Auth.saveUsers) window.Auth.saveUsers(users);

      if (window.Auth && window.Auth.showToast) window.Auth.showToast(`User ${name} (${role.toUpperCase()}) added!`, 'success');
      addUserForm.reset();
      if (addUserModal) addUserModal.classList.remove('active');
      renderUsersTable();
      renderOverviewCards();
    });
  }

  // Add Discount Form Submission
  const addDiscountForm = document.getElementById('addDiscountForm');
  if (addDiscountForm) {
    addDiscountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('discCode').value.trim();
      const discountPercent = document.getElementById('discPercent').value;
      const minSpend = document.getElementById('discMinSpend').value;

      Store.addDiscount({ code, discountPercent, minSpend });
      if (window.Auth && window.Auth.showToast) window.Auth.showToast(`Promo code ${code.toUpperCase()} created!`, 'success');
      addDiscountForm.reset();
      renderDiscountsTable();
    });
  }

  // System Backup / Reset
  const resetSystemBtn = document.getElementById('resetSystemBtn');
  if (resetSystemBtn) {
    resetSystemBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all products, orders, and feedback back to initial default values?')) {
        Store.resetStore();
        if (window.Auth && window.Auth.showToast) window.Auth.showToast('Store data re-seeded successfully!', 'success');
        setTimeout(() => window.location.reload(), 800);
      }
    });
  }

  const exportDataBtn = document.getElementById('exportDataBtn');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      const data = {
        users: (window.Auth && window.Auth.getUsers) ? window.Auth.getUsers() : JSON.parse(localStorage.getItem('users') || '[]'),
        products: Store.getProducts(),
        orders: Store.getOrders(),
        discounts: Store.getDiscounts(),
        feedbacks: Store.getFeedbacks()
      };
      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonStr);
      downloadAnchor.setAttribute("download", `laylpur_bakery_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (window.Auth && window.Auth.showToast) window.Auth.showToast('Backup JSON file downloaded!', 'success');
    });
  }
}

// Render Overview Cards
function renderOverviewCards() {
  const container = document.getElementById('adminOverviewCards');
  if (!container) return;

  const orders = Store.getOrders();
  const users = (window.Auth && window.Auth.getUsers) ? window.Auth.getUsers() : JSON.parse(localStorage.getItem('users') || '[]');
  const products = Store.getProducts();
  
  const completed = orders.filter(o => o.status === 'delivered');
  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = products.filter(p => p.stock < 10).length;

  container.innerHTML = `
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md)">
      <div style="font-size:0.8rem; color:var(--text-subtle); text-transform:uppercase">Total Store Sales</div>
      <div style="font-size:1.8rem; font-weight:800; color:var(--amber-primary)">$${totalRevenue.toFixed(2)}</div>
    </div>
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md)">
      <div style="font-size:0.8rem; color:var(--text-subtle); text-transform:uppercase">Total Customer Orders</div>
      <div style="font-size:1.8rem; font-weight:800">${orders.length}</div>
    </div>
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md)">
      <div style="font-size:0.8rem; color:var(--text-subtle); text-transform:uppercase">Registered Accounts</div>
      <div style="font-size:1.8rem; font-weight:800">${users.length} Users</div>
    </div>
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md)">
      <div style="font-size:0.8rem; color:var(--text-subtle); text-transform:uppercase">Low Stock Warnings</div>
      <div style="font-size:1.8rem; font-weight:800; color:${lowStockCount > 0 ? '#ef4444' : '#10b981'}">${lowStockCount} Items</div>
    </div>
  `;
}

// Render Users Table
function renderUsersTable() {
  const table = document.getElementById('adminUsersTable');
  if (!table) return;

  const users = (window.Auth && window.Auth.getUsers) ? window.Auth.getUsers() : JSON.parse(localStorage.getItem('users') || '[]');

  table.innerHTML = users.map((u, idx) => `
    <tr>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td><span class="role-badge badge-${u.role}">${u.role}</span></td>
      <td>
        <button class="btn-danger btn-sm" onclick="window.deleteUserPrompt('${u.email}')">🗑️ Remove</button>
      </td>
    </tr>
  `).join('');
}

window.deleteUserPrompt = function(email) {
  const current = window.getCurrentUser ? window.getCurrentUser() : null;
  if (current && current.email.toLowerCase() === email.toLowerCase()) {
    if (window.Auth && window.Auth.showToast) window.Auth.showToast('You cannot delete your own active admin account!', 'error');
    return;
  }

  if (confirm(`Are you sure you want to remove user account (${email})?`)) {
    const users = ((window.Auth && window.Auth.getUsers) ? window.Auth.getUsers() : JSON.parse(localStorage.getItem('users') || '[]')).filter(u => u.email.toLowerCase() !== email.toLowerCase());
    if (window.Auth && window.Auth.saveUsers) window.Auth.saveUsers(users);
    if (window.Auth && window.Auth.showToast) window.Auth.showToast('User removed successfully.', 'info');
    renderUsersTable();
    renderOverviewCards();
  }
};

// Render Product Management Table
function renderProductsTable() {
  const table = document.getElementById('adminProductsTable');
  if (!table) return;

  const products = Store.getProducts();

  table.innerHTML = products.map(p => `
    <tr>
      <td>
        <img src="${p.image}" alt="${p.title}" style="width:40px; height:40px; border-radius:6px; object-fit:cover" />
      </td>
      <td><strong>${p.title}</strong></td>
      <td>${p.category}</td>
      <td>$${p.price.toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn-secondary btn-sm" onclick="window.editPricePrompt('${p.id}', ${p.price})">💲 Price</button>
        <button class="btn-danger btn-sm" onclick="window.deleteProductAdmin('${p.id}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

window.editPricePrompt = function(id, currentPrice) {
  const newPrice = prompt(`Enter new price for this item:`, currentPrice);
  if (newPrice !== null && !isNaN(newPrice)) {
    Store.updateProduct(id, { price: parseFloat(newPrice) });
    if (window.Auth && window.Auth.showToast) window.Auth.showToast('Product price updated!', 'success');
    renderProductsTable();
  }
};

window.deleteProductAdmin = function(id) {
  if (confirm('Delete this product from bakery catalog?')) {
    Store.deleteProduct(id);
    if (window.Auth && window.Auth.showToast) window.Auth.showToast('Product deleted.', 'info');
    renderProductsTable();
  }
};

// Render Sales Reports
function renderSalesReport() {
  const container = document.getElementById('salesReportContent');
  if (!container) return;

  const orders = Store.getOrders();
  const completed = orders.filter(o => o.status === 'delivered');
  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);
  const avgValue = completed.length > 0 ? (totalRevenue / completed.length) : 0;

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem">
      <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:var(--radius-md)">
        <div style="font-size:0.75rem; color:var(--text-subtle)">COMMISSION / TOTAL REVENUE</div>
        <div style="font-size:1.5rem; font-weight:800; color:var(--amber-primary)">$${totalRevenue.toFixed(2)}</div>
      </div>
      <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:var(--radius-md)">
        <div style="font-size:0.75rem; color:var(--text-subtle)">AVG ORDER VALUE</div>
        <div style="font-size:1.5rem; font-weight:800">$${avgValue.toFixed(2)}</div>
      </div>
      <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:var(--radius-md)">
        <div style="font-size:0.75rem; color:var(--text-subtle)">COMPLETED DELIVERIES</div>
        <div style="font-size:1.5rem; font-weight:800; color:#10b981">${completed.length} Orders</div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Payment</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td><strong>${o.id}</strong></td>
              <td>${o.customerName}</td>
              <td>${o.items.length} items</td>
              <td>${o.paymentMethod}</td>
              <td>$${o.total.toFixed(2)}</td>
              <td><span class="badge-status status-${o.status}">${o.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Render Discounts Table
function renderDiscountsTable() {
  const table = document.getElementById('adminDiscountsTable');
  if (!table) return;

  const discounts = Store.getDiscounts();

  table.innerHTML = discounts.map(d => `
    <tr>
      <td><strong style="color:var(--amber-primary)">${d.code}</strong></td>
      <td>${d.discountPercent}% OFF</td>
      <td>Min Spend $${d.minSpend}</td>
      <td><span style="color:${d.active ? '#10b981' : '#ef4444'}; font-weight:700">${d.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
    </tr>
  `).join('');
}

// Render Feedbacks Table
function renderFeedbacksTable() {
  const table = document.getElementById('adminFeedbacksTable');
  if (!table) return;

  const feedbacks = Store.getFeedbacks();

  if (feedbacks.length === 0) {
    table.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-subtle)">No customer feedback or complaints logged yet.</td></tr>`;
    return;
  }

  table.innerHTML = feedbacks.map(f => `
    <tr>
      <td><strong>${f.customerName}</strong><br/><span style="font-size:0.75rem; color:var(--text-subtle)">${f.email}</span></td>
      <td>${f.subject}</td>
      <td>${f.message}</td>
      <td><span style="font-weight:700; color:${f.status === 'resolved' ? '#10b981' : '#f59e0b'}">${f.status.toUpperCase()}</span></td>
      <td>
        ${f.status === 'open' ? `<button class="btn-secondary btn-sm" onclick="window.resolveFb('${f.id}')">✓ Resolve</button>` : '✓ Done'}
      </td>
    </tr>
  `).join('');
}

window.resolveFb = function(id) {
  Store.resolveFeedback(id);
  if (window.Auth && window.Auth.showToast) window.Auth.showToast('Feedback marked as resolved.', 'success');
  renderFeedbacksTable();
};
