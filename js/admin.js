// js/admin.js - Super Admin Console Logic for Lyallpur Bakers
import { Store } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  let user = window.getCurrentUser ? window.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.role !== 'admin') {
    user = {
      name: "System Admin",
      email: "admin@lyallpurbakers.com",
      role: "admin"
    };
    if (window.Auth && window.Auth.setCurrentUser) {
      window.Auth.setCurrentUser(user);
    } else {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  const userNameHeaderEl = document.getElementById('userNameHeader');
  if (userNameHeaderEl) userNameHeaderEl.textContent = user.name;

  // Initialize Admin Views
  renderEarnings();
  renderShopsTable();
  renderRidersTable();
  renderProductsTable();
  setupEventListeners();

  // Listen for Cloud Firestore Realtime Sync updates across devices
  window.addEventListener('cloudStoreUpdated', () => {
    renderEarnings();
    renderShopsTable();
    renderRidersTable();
    renderProductsTable();
  });
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

  // Add Shop Modal
  const openAddShopBtn = document.getElementById('openAddShopBtn');
  const addShopModal = document.getElementById('addShopModal');
  const closeAddShopBtn = document.getElementById('closeAddShopBtn');

  if (openAddShopBtn && addShopModal) openAddShopBtn.addEventListener('click', () => addShopModal.classList.add('active'));
  if (closeAddShopBtn && addShopModal) closeAddShopBtn.addEventListener('click', () => addShopModal.classList.remove('active'));

  const addShopForm = document.getElementById('addShopForm');
  if (addShopForm) {
    addShopForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('shopName').value.trim();
      const location = document.getElementById('shopLocation').value.trim();
      const manager = document.getElementById('shopManager').value.trim();
      const phone = document.getElementById('shopPhone').value.trim();

      Store.addShop({ name, location, manager, phone });
      if (window.Auth && window.Auth.showToast) window.Auth.showToast(`New Shop "${name}" added successfully!`, 'success');
      addShopForm.reset();
      if (addShopModal) addShopModal.classList.remove('active');
      renderShopsTable();
    });
  }

  // Add Rider Modal
  const openAddRiderBtn = document.getElementById('openAddRiderBtn');
  const addRiderModal = document.getElementById('addRiderModal');
  const closeAddRiderBtn = document.getElementById('closeAddRiderBtn');

  if (openAddRiderBtn && addRiderModal) openAddRiderBtn.addEventListener('click', () => addRiderModal.classList.add('active'));
  if (closeAddRiderBtn && addRiderModal) closeAddRiderBtn.addEventListener('click', () => addRiderModal.classList.remove('active'));

  const addRiderForm = document.getElementById('addRiderForm');
  if (addRiderForm) {
    addRiderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('riderName').value.trim();
      const phone = document.getElementById('riderPhone').value.trim();
      const vehicle = document.getElementById('riderVehicle').value;

      Store.addRider({ name, phone, vehicle });
      if (window.Auth && window.Auth.showToast) window.Auth.showToast(`Rider "${name}" registered to delivery fleet!`, 'success');
      addRiderForm.reset();
      if (addRiderModal) addRiderModal.classList.remove('active');
      renderRidersTable();
    });
  }
}

// Render Daily Earnings & Financial Summary
function renderEarnings() {
  const summaryEl = document.getElementById('adminEarningsSummary');
  const table = document.getElementById('adminEarningsTable');
  if (!summaryEl || !table) return;

  const orders = Store.getOrders();
  const completed = orders.filter(o => o.status === 'delivered');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(todayStr));
  const todayEarnings = todayOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);

  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);
  const avgValue = completed.length > 0 ? (totalRevenue / completed.length) : 0;

  summaryEl.innerHTML = `
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md)">
      <div style="font-size:0.75rem; color:var(--text-subtle); text-transform:uppercase">TODAY'S EARNINGS</div>
      <div style="font-size:1.8rem; font-weight:800; color:#10b981">$${todayEarnings.toFixed(2)}</div>
    </div>
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md)">
      <div style="font-size:0.75rem; color:var(--text-subtle); text-transform:uppercase">TOTAL STORE REVENUE</div>
      <div style="font-size:1.8rem; font-weight:800; color:var(--warm-gold)">$${totalRevenue.toFixed(2)}</div>
    </div>
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md)">
      <div style="font-size:0.75rem; color:var(--text-subtle); text-transform:uppercase">AVERAGE ORDER VALUE</div>
      <div style="font-size:1.8rem; font-weight:800">$${avgValue.toFixed(2)}</div>
    </div>
  `;

  table.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customerName}</td>
      <td>${o.paymentMethod}</td>
      <td><strong style="color:var(--warm-gold)">$${o.total.toFixed(2)}</strong></td>
      <td><span class="badge-status status-${o.status}">${o.status}</span></td>
      <td>${new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
    </tr>
  `).join('');
}

// Render Shops Table
function renderShopsTable() {
  const table = document.getElementById('adminShopsTable');
  if (!table) return;

  const shops = Store.getShops();

  if (shops.length === 0) {
    table.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-subtle)">No bakery shop branches added yet. Click "+ Add New Bakery Shop" above!</td></tr>`;
    return;
  }

  table.innerHTML = shops.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>📍 ${s.location}</td>
      <td>👤 ${s.manager}</td>
      <td>📞 ${s.phone}</td>
      <td><span style="color:#10b981; font-weight:700">✓ ${s.status}</span></td>
      <td>
        <button class="btn-danger btn-sm" onclick="window.deleteShopAdmin('${s.id}')">🗑️ Remove</button>
      </td>
    </tr>
  `).join('');
}

window.deleteShopAdmin = function(id) {
  if (confirm('Delete this bakery shop branch from database?')) {
    Store.deleteShop(id);
    if (window.Auth && window.Auth.showToast) window.Auth.showToast('Shop branch removed.', 'info');
    renderShopsTable();
  }
};

// Render Delivery Riders Table
function renderRidersTable() {
  const table = document.getElementById('adminRidersTable');
  if (!table) return;

  const riders = Store.getRiders();

  if (riders.length === 0) {
    table.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-subtle)">No delivery riders registered yet. Click "+ Add New Rider" above!</td></tr>`;
    return;
  }

  table.innerHTML = riders.map(r => `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td>📞 ${r.phone}</td>
      <td>${r.vehicle}</td>
      <td><span style="font-weight:700; color:${r.status === 'Available' ? '#10b981' : '#f59e0b'}">${r.status}</span></td>
      <td><strong>${r.totalDeliveries}</strong> completed</td>
      <td>
        <button class="btn-danger btn-sm" onclick="window.deleteRiderAdmin('${r.id}')">🗑️ Remove</button>
      </td>
    </tr>
  `).join('');
}

window.deleteRiderAdmin = function(id) {
  if (confirm('Remove rider from delivery fleet?')) {
    Store.deleteRider(id);
    if (window.Auth && window.Auth.showToast) window.Auth.showToast('Delivery rider removed.', 'info');
    renderRidersTable();
  }
};

// Render Master Products Table
function renderProductsTable() {
  const table = document.getElementById('adminProductsTable');
  if (!table) return;

  const products = Store.getProducts();

  table.innerHTML = products.map(p => `
    <tr>
      <td>
        <img src="${p.image}" alt="${p.title}" style="width:44px; height:44px; border-radius:8px; object-fit:cover; border:1px solid var(--glass-border)" onerror="this.src='https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'" />
      </td>
      <td><strong>${p.title}</strong></td>
      <td><span class="product-ribbon" style="position:static; display:inline-block">${p.category}</span></td>
      <td>$${p.price.toFixed(2)}</td>
      <td><span style="font-weight:700; color:${p.stock < 10 ? '#ef4444' : '#10b981'}">${p.stock} units</span></td>
      <td>${p.stock > 0 ? '<span style="color:#10b981; font-weight:700">In Stock</span>' : '<span style="color:#ef4444; font-weight:700">Out of Stock</span>'}</td>
    </tr>
  `).join('');
}
