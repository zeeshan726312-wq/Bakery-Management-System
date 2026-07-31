// js/shopkeeper.js - Master Shopkeeper Control Panel Logic for Lyallpur Bakers
import { Store } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  let user = window.getCurrentUser ? window.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser'));
  if (!user || (user.role !== 'shopkeeper' && user.role !== 'admin')) {
    user = {
      name: "Master Baker",
      email: "shopkeeper@lyallpurbakers.com",
      role: "shopkeeper"
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

  // Initialize UI Views
  renderProductsTable();
  renderOrderQueue();
  renderShopInfoForm();
  renderSalesReport();
  renderUsersTable();
  renderDiscountsTable();
  renderFeedbacksTable();
  renderStockAlerts();
  setupEventListeners();

  // Listen for Cloud Firestore Realtime Sync updates across devices
  window.addEventListener('cloudStoreUpdated', () => {
    renderProductsTable();
    renderOrderQueue();
    renderShopInfoForm();
    renderSalesReport();
    renderStockAlerts();
    renderFeedbacksTable();
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

  // Add Product Modal Toggles
  const openAddProductBtn = document.getElementById('openAddProductBtn');
  const addProductModal = document.getElementById('addProductModal');
  const closeAddProductBtn = document.getElementById('closeAddProductBtn');

  if (openAddProductBtn && addProductModal) {
    openAddProductBtn.addEventListener('click', () => addProductModal.classList.add('active'));
  }
  if (closeAddProductBtn && addProductModal) {
    closeAddProductBtn.addEventListener('click', () => addProductModal.classList.remove('active'));
  }

  // Photo File / URL preview handler
  const prodImgFileInput = document.getElementById('prodImgFile');
  const prodImgUrlInput = document.getElementById('prodImgUrl');
  const imgPreview = document.getElementById('imgPreview');

  if (prodImgFileInput) {
    prodImgFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (imgPreview) {
            imgPreview.src = event.target.result;
            imgPreview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (prodImgUrlInput) {
    prodImgUrlInput.addEventListener('input', () => {
      if (prodImgUrlInput.value.trim() && imgPreview) {
        imgPreview.src = prodImgUrlInput.value.trim();
        imgPreview.style.display = 'block';
      }
    });
  }

  // Add Product Form Submission
  const addProductForm = document.getElementById('addProductForm');
  if (addProductForm) {
    addProductForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('prodTitle').value.trim();
      const category = document.getElementById('prodCategory').value;
      const price = parseFloat(document.getElementById('prodPrice').value);
      const stock = parseInt(document.getElementById('prodStock').value);
      const discount = parseInt(document.getElementById('prodDiscount').value) || 0;
      const description = document.getElementById('prodDesc').value.trim();

      let image = (imgPreview && imgPreview.style.display !== 'none') ? imgPreview.src : (document.getElementById('prodImgUrl').value.trim() || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80");

      Store.addProduct({
        title,
        category,
        price,
        stock,
        discount,
        description,
        image
      });

      if (window.Auth && window.Auth.showToast) window.Auth.showToast(`Product "${title}" published! Visible in shop catalog now.`, 'success');
      addProductForm.reset();
      if (imgPreview) imgPreview.style.display = 'none';
      if (addProductModal) addProductModal.classList.remove('active');
      renderProductsTable();
      renderStockAlerts();
    });
  }

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
      downloadAnchor.setAttribute("download", `lyallpur_bakers_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (window.Auth && window.Auth.showToast) window.Auth.showToast('Backup JSON file downloaded!', 'success');
    });
  }
}

// Render Products Table
function renderProductsTable() {
  const table = document.getElementById('shopProductsTable');
  if (!table) return;

  const products = Store.getProducts();

  if (products.length === 0) {
    table.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-subtle)">No bakery products added yet. Click "+ Add New Bakery Item" above!</td></tr>`;
    return;
  }

  table.innerHTML = products.map(p => `
    <tr>
      <td>
        <img src="${p.image}" alt="${p.title}" style="width:48px; height:48px; border-radius:8px; object-fit:cover; border:1px solid var(--glass-border)" onerror="this.src='https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'" />
      </td>
      <td><strong>${p.title}</strong></td>
      <td><span class="product-ribbon" style="position:static; display:inline-block">${p.category}</span></td>
      <td>$${p.price.toFixed(2)}</td>
      <td>
        <span style="font-weight:700; color:${p.stock < 10 ? '#ef4444' : '#10b981'}">${p.stock} units</span>
      </td>
      <td>${p.discount > 0 ? `<span style="color:#f59e0b; font-weight:700">-${p.discount}%</span>` : '0%'}</td>
      <td>
        <button class="btn-secondary btn-sm" onclick="window.editStockPrompt('${p.id}', ${p.stock})">✏️ Stock</button>
        <button class="btn-danger btn-sm" onclick="window.deleteProductPrompt('${p.id}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

window.editStockPrompt = function(id, currentStock) {
  const newStock = prompt(`Update inventory stock quantity for product:`, currentStock);
  if (newStock !== null && !isNaN(newStock)) {
    Store.updateProduct(id, { stock: parseInt(newStock) });
    if (window.Auth && window.Auth.showToast) window.Auth.showToast('Stock level updated!', 'success');
    renderProductsTable();
    renderStockAlerts();
  }
};

window.deleteProductPrompt = function(id) {
  if (confirm('Are you sure you want to delete this bakery item from the menu?')) {
    Store.deleteProduct(id);
    if (window.Auth && window.Auth.showToast) window.Auth.showToast('Product deleted from bakery catalog.', 'info');
    renderProductsTable();
    renderStockAlerts();
  }
};

// Render Live Order Queue
function renderOrderQueue() {
  const container = document.getElementById('shopOrderQueue');
  if (!container) return;

  const orders = Store.getOrders();

  if (orders.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:2.5rem; color:var(--text-subtle)">No customer orders in queue right now.</div>`;
    return;
  }

  container.innerHTML = orders.map(o => `
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md); margin-bottom:1rem">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem">
        <div>
          <strong style="font-size:1.1rem">Order #${o.id}</strong>
          <span style="font-size:0.85rem; color:var(--text-subtle); margin-left:0.5rem">by ${o.customerName} (${o.phone})</span>
        </div>
        <span class="badge-status status-${o.status}">${o.status}</span>
      </div>

      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem">
        📍 <strong>Delivery Address:</strong> ${o.address} | 💳 <strong>Payment:</strong> ${o.paymentMethod} ($${o.total.toFixed(2)})
      </div>

      <div style="background:rgba(0,0,0,0.3); padding:0.75rem; border-radius:8px; margin-bottom:0.75rem">
        ${o.items.map(i => `<div style="font-size:0.85rem; color:var(--amber-light)">${i.qty}x ${i.title} - $${(i.price * i.qty).toFixed(2)}</div>`).join('')}
      </div>

      <div style="display:flex; gap:0.5rem; flex-wrap:wrap">
        ${o.status === 'pending' ? `
          <button class="btn-primary btn-sm" onclick="window.updateOrderStatus('${o.id}', 'baking')">🔥 Start Baking in Oven</button>
          <button class="btn-danger btn-sm" onclick="window.updateOrderStatus('${o.id}', 'cancelled')">✕ Reject Order</button>
        ` : ''}
        ${o.status === 'baking' ? `
          <button class="btn-primary btn-sm" style="background:#a855f7" onclick="window.updateOrderStatus('${o.id}', 'ready')">✨ Mark Oven Ready & Boxed</button>
        ` : ''}
        ${o.status === 'ready' ? `
          <button class="btn-primary btn-sm" style="background:#10b981" onclick="window.updateOrderStatus('${o.id}', 'delivered')">🚴 Out for Delivery / Delivered</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

window.updateOrderStatus = function(orderId, newStatus) {
  Store.updateOrderStatus(orderId, newStatus);
  if (window.Auth && window.Auth.showToast) window.Auth.showToast(`Order #${orderId} marked as ${newStatus.toUpperCase()}!`, 'success');
  renderOrderQueue();
  renderSalesReport();
};

// Render Sales Reports & Financial Analytics
function renderSalesReport() {
  const container = document.getElementById('salesReportContent');
  if (!container) return;

  const orders = Store.getOrders();
  const completed = orders.filter(o => o.status === 'delivered');
  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);
  const avgValue = completed.length > 0 ? (totalRevenue / completed.length) : 0;

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem">
      <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md)">
        <div style="font-size:0.75rem; color:var(--text-subtle)">TOTAL STORE REVENUE</div>
        <div style="font-size:1.6rem; font-weight:800; color:var(--warm-gold)">$${totalRevenue.toFixed(2)}</div>
      </div>
      <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md)">
        <div style="font-size:0.75rem; color:var(--text-subtle)">AVERAGE ORDER VALUE</div>
        <div style="font-size:1.6rem; font-weight:800">$${avgValue.toFixed(2)}</div>
      </div>
      <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md)">
        <div style="font-size:0.75rem; color:var(--text-subtle)">COMPLETED DELIVERIES</div>
        <div style="font-size:1.6rem; font-weight:800; color:#10b981">${completed.length} Orders</div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Items</th>
            <th>Payment</th>
            <th>Total Amount</th>
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

// Render Users Table
function renderUsersTable() {
  const table = document.getElementById('shopUsersTable');
  if (!table) return;

  const users = (window.Auth && window.Auth.getUsers) ? window.Auth.getUsers() : JSON.parse(localStorage.getItem('users') || '[]');

  table.innerHTML = users.map((u) => `
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
    if (window.Auth && window.Auth.showToast) window.Auth.showToast('You cannot delete your own active account!', 'error');
    return;
  }

  if (confirm(`Are you sure you want to remove user account (${email})?`)) {
    const users = ((window.Auth && window.Auth.getUsers) ? window.Auth.getUsers() : JSON.parse(localStorage.getItem('users') || '[]')).filter(u => u.email.toLowerCase() !== email.toLowerCase());
    if (window.Auth && window.Auth.saveUsers) window.Auth.saveUsers(users);
    if (window.Auth && window.Auth.showToast) window.Auth.showToast('User removed successfully.', 'info');
    renderUsersTable();
  }
};

// Render Discounts Table
function renderDiscountsTable() {
  const table = document.getElementById('shopDiscountsTable');
  if (!table) return;

  const discounts = Store.getDiscounts();

  table.innerHTML = discounts.map(d => `
    <tr>
      <td><strong style="color:var(--warm-gold)">${d.code}</strong></td>
      <td>${d.discountPercent}% OFF</td>
      <td>Min Spend $${d.minSpend}</td>
      <td><span style="color:${d.active ? '#10b981' : '#ef4444'}; font-weight:700">${d.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
    </tr>
  `).join('');
}

// Render Feedbacks Table
function renderFeedbacksTable() {
  const table = document.getElementById('shopFeedbacksTable');
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

// Render Low Stock Warning Cards
function renderStockAlerts() {
  const container = document.getElementById('stockAlerts');
  if (!container) return;

  const products = Store.getProducts().filter(p => p.stock < 10);

  if (products.length === 0) {
    container.innerHTML = `<div style="color:#10b981; font-weight:600">✓ All bakery items have healthy stock levels above 10 units.</div>`;
    return;
  }

  container.innerHTML = `
    <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); padding:1rem; border-radius:var(--radius-md)">
      <h4 style="color:#fca5a5; margin-bottom:0.5rem">⚠️ Low Inventory Stock Alerts (${products.length} items)</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem">
        ${products.map(p => `
          <div style="display:flex; justify-content:space-between; font-size:0.85rem">
            <span><strong>${p.title}</strong> (${p.category})</span>
            <span style="color:#ef4444; font-weight:700">${p.stock} units remaining</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderShopInfoForm() {
  const info = Store.getShopInfo();
  if (document.getElementById('infoShopkeeperName')) document.getElementById('infoShopkeeperName').value = info.shopkeeperName || '';
  if (document.getElementById('infoShopName')) document.getElementById('infoShopName').value = info.shopName || '';
  if (document.getElementById('infoPhone')) document.getElementById('infoPhone').value = info.phone || '';
  if (document.getElementById('infoAddress')) document.getElementById('infoAddress').value = info.address || '';
  if (document.getElementById('infoHours')) document.getElementById('infoHours').value = info.hours || '';
}

// Attach Form Listener
const origSetupEvents = setupEventListeners;
setupEventListeners = function() {
  origSetupEvents();
  const shopInfoForm = document.getElementById('shopInfoForm');
  if (shopInfoForm) {
    shopInfoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      Store.saveShopInfo({
        shopkeeperName: document.getElementById('infoShopkeeperName').value.trim(),
        shopName: document.getElementById('infoShopName').value.trim(),
        phone: document.getElementById('infoPhone').value.trim(),
        address: document.getElementById('infoAddress').value.trim(),
        hours: document.getElementById('infoHours').value.trim()
      });
      if (window.Auth && window.Auth.showToast) window.Auth.showToast('Shopkeeper contact details & address updated live!', 'success');
    });
  }
};

window.selectPresetImage = function(imageName, defaultTitle, defaultCategory, defaultPrice) {
  const urlInput = document.getElementById('prodImgUrl');
  const titleInput = document.getElementById('prodTitle');
  const catInput = document.getElementById('prodCategory');
  const priceInput = document.getElementById('prodPrice');
  const imgPreview = document.getElementById('imgPreview');

  if (urlInput) urlInput.value = imageName;
  if (titleInput && !titleInput.value) titleInput.value = defaultTitle;
  if (catInput) catInput.value = defaultCategory;
  if (priceInput && !priceInput.value) priceInput.value = defaultPrice;

  if (imgPreview) {
    imgPreview.src = imageName;
    imgPreview.style.display = 'block';
  }

  if (window.Auth && window.Auth.showToast) window.Auth.showToast(`Selected picture: ${imageName}`, 'info');
};
