// js/customer.js - Interactive Customer Portal Logic for Lyallpur Bakers
import { Store } from './store.js';

let cart = [];
let appliedDiscount = 0;
let currentCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
  // Ensure customer auth fallback
  let user = window.getCurrentUser ? window.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.role !== 'customer') {
    user = {
      name: "Alice Baker",
      email: "customer@lyallpurbakers.com",
      role: "customer"
    };
    if (window.Auth && window.Auth.setCurrentUser) {
      window.Auth.setCurrentUser(user);
    } else {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  // Set user details
  const userNameEl = document.getElementById('userName');
  const userNameHeaderEl = document.getElementById('userNameHeader');
  if (userNameEl) userNameEl.textContent = user.name;
  if (userNameHeaderEl) userNameHeaderEl.textContent = user.name;
  if (document.getElementById('profName')) document.getElementById('profName').value = user.name;
  if (document.getElementById('profEmail')) document.getElementById('profEmail').value = user.email;

  // Initialize UI
  renderShopInfoBanner();
  renderProducts();
  renderTracker();
  renderOrderHistory();
  updateCartBadge();
  setupEventListeners();

  // Realtime oven countdown timer
  initOvenTimer();

  // Listen for Cloud Firestore Realtime Sync updates across devices
  window.addEventListener('cloudStoreUpdated', () => {
    renderShopInfoBanner();
    renderProducts();
    renderTracker();
    renderOrderHistory();
  });
});

function initOvenTimer() {
  const timerSpan = document.getElementById('ovenTimerCountdown');
  if (!timerSpan) return;

  let seconds = 825; // 13 mins 45s countdown
  setInterval(() => {
    seconds--;
    if (seconds <= 0) seconds = 900;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    timerSpan.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }, 1000);
}

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

  // Category Filtering
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-cat');
      renderProducts();
    });
  });

  // Search filter
  const searchInput = document.getElementById('searchProducts');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderProducts();
    });
  }

  // Cart Drawer Toggles
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartDrawer = document.getElementById('cartDrawer');

  const toggleCart = (open) => {
    if (open) {
      if (cartBackdrop) cartBackdrop.classList.add('active');
      if (cartDrawer) cartDrawer.classList.add('active');
      renderCart();
    } else {
      if (cartBackdrop) cartBackdrop.classList.remove('active');
      if (cartDrawer) cartDrawer.classList.remove('active');
    }
  };

  if (openCartBtn) openCartBtn.addEventListener('click', () => toggleCart(true));
  if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
  if (cartBackdrop) cartBackdrop.addEventListener('click', () => toggleCart(false));

  // Checkout modal
  const openCheckoutBtn = document.getElementById('openCheckoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');

  if (openCheckoutBtn) {
    openCheckoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        if (window.Auth && window.Auth.showToast) window.Auth.showToast('Your bakery basket is empty!', 'error');
        return;
      }
      toggleCart(false);
      if (checkoutModal) checkoutModal.classList.add('active');
      renderCheckoutSummary();
    });
  }

  if (closeCheckoutBtn && checkoutModal) {
    closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('active'));
  }

  // Checkout Form Submission
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = (window.getCurrentUser ? window.getCurrentUser() : null) || { email: "customer@lyallpurbakers.com", name: "Alice Baker" };
      const address = document.getElementById('checkoutAddress').value.trim();
      const phone = document.getElementById('checkoutPhone').value.trim();
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const discountAmount = (subtotal * appliedDiscount) / 100;
      const total = subtotal - discountAmount;

      const newOrder = Store.addOrder({
        customerEmail: user.email,
        customerName: user.name,
        address,
        phone,
        items: cart,
        subtotal,
        discountAmount,
        total,
        paymentMethod
      });

      if (window.Auth && window.Auth.showToast) window.Auth.showToast(`Bakery Order #${newOrder.id} sent to oven!`, 'success');
      cart = [];
      appliedDiscount = 0;
      updateCartBadge();
      if (checkoutModal) checkoutModal.classList.remove('active');

      // Switch tab to Live Tracker
      const trackerTabBtn = document.querySelector('[data-target="trackerTab"]');
      if (trackerTabBtn) trackerTabBtn.click();
      renderTracker();
      renderOrderHistory();
      renderProducts();
    });
  }

  // Coupon Application
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', () => {
      const codeInput = document.getElementById('couponCode').value.trim().toUpperCase();
      const discounts = Store.getDiscounts();
      const disc = discounts.find(d => d.code === codeInput && d.active);

      if (disc) {
        appliedDiscount = disc.discountPercent;
        if (window.Auth && window.Auth.showToast) window.Auth.showToast(`Bakery Coupon applied! ${disc.discountPercent}% OFF`, 'success');
        renderCart();
      } else {
        if (window.Auth && window.Auth.showToast) window.Auth.showToast('Invalid coupon code. Try LYALLPUR10!', 'error');
      }
    });
  }

  // Profile Save Form
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = (window.getCurrentUser ? window.getCurrentUser() : null) || { email: "customer@lyallpurbakers.com", name: "Alice Baker", role: "customer" };
      user.name = document.getElementById('profName').value;
      user.phone = document.getElementById('profPhone').value;
      user.address = document.getElementById('profAddress').value;
      if (window.Auth && window.Auth.setCurrentUser) window.Auth.setCurrentUser(user);
      const userNameEl = document.getElementById('userName');
      const userNameHeaderEl = document.getElementById('userNameHeader');
      if (userNameEl) userNameEl.textContent = user.name;
      if (userNameHeaderEl) userNameHeaderEl.textContent = user.name;
      if (window.Auth && window.Auth.showToast) window.Auth.showToast('Profile updated successfully!', 'success');
    });
  }

  // Feedback Submission Form
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = (window.getCurrentUser ? window.getCurrentUser() : null) || { email: "customer@lyallpurbakers.com", name: "Alice Baker" };
      const subject = document.getElementById('fbSubject').value.trim();
      const message = document.getElementById('fbMessage').value.trim();

      Store.addFeedback({
        customerName: user.name,
        email: user.email,
        subject,
        message
      });

      if (window.Auth && window.Auth.showToast) window.Auth.showToast('Thank you! Your feedback sent to Lyallpur Bakers management.', 'success');
      feedbackForm.reset();
    });
  }
}

// Render Products Grid with Bakery Ribbon Badges
function renderProducts() {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  const products = Store.getProducts();
  const searchVal = (document.getElementById('searchProducts')?.value || '').toLowerCase();

  const filtered = products.filter(p => {
    const matchesCat = currentCategory === 'All' || p.category === currentCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchVal) || p.description.toLowerCase().includes(searchVal);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-subtle)">No fresh bakery items found matching your search.</div>`;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const discountedPrice = p.discount > 0 ? (p.price * (1 - p.discount/100)).toFixed(2) : p.price.toFixed(2);
    const ribbonText = p.ribbon || (p.discount > 0 ? 'Special Offer 🎉' : 'Oven Fresh ♨️');

    return `
      <div class="product-card">
        <div class="product-img-wrapper">
          <img src="${p.image}" alt="${p.title}" class="product-img" onerror="this.src='https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'" />
          <span class="product-ribbon">${ribbonText}</span>
          ${p.discount > 0 ? `<span class="discount-badge">-${p.discount}% OFF</span>` : ''}
        </div>
        <div class="product-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start">
            <h3 class="product-title">${p.title}</h3>
            <span style="font-size:0.8rem; color:var(--warm-gold); font-weight:700; white-space:nowrap; margin-left:0.5rem">★ ${p.rating}</span>
          </div>
          <p class="product-desc">${p.description}</p>
          <div style="font-size:0.75rem; margin-bottom:0.75rem; color:${p.stock > 5 ? '#10b981' : '#ef4444'}; font-weight:700">
            ${p.stock > 0 ? `♨️ Oven Fresh (${p.stock} remaining today)` : '❌ Sold Out For Today'}
          </div>
          <div class="product-footer">
            <div>
              <span class="product-price">$${discountedPrice}</span>
              ${p.discount > 0 ? `<span class="old-price">$${p.price.toFixed(2)}</span>` : ''}
            </div>
            <button onclick="window.addToCart('${p.id}')" ${p.stock <= 0 ? 'disabled style="opacity:0.5; cursor:not-allowed"' : ''} class="btn-primary" style="padding:0.45rem 0.95rem; font-size:0.85rem">
              + Add to Basket 🧺
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Cart Management
window.addToCart = function(productId) {
  const products = Store.getProducts();
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    if (existing.qty >= prod.stock) {
      if (window.Auth && window.Auth.showToast) window.Auth.showToast(`Sorry, only ${prod.stock} baked items in stock!`, 'error');
      return;
    }
    existing.qty += 1;
  } else {
    const finalPrice = prod.discount > 0 ? prod.price * (1 - prod.discount/100) : prod.price;
    cart.push({
      id: prod.id,
      title: prod.title,
      price: finalPrice,
      image: prod.image,
      qty: 1
    });
  }

  updateCartBadge();
  if (window.Auth && window.Auth.showToast) window.Auth.showToast(`Added "${prod.title}" to your Bakery Basket!`, 'success');
};

function updateCartBadge() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = count;
}

function renderCart() {
  const list = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');

  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:2.5rem; color:var(--text-subtle)">
      <div style="font-size:2.5rem; margin-bottom:0.5rem">🧺</div>
      Your bakery basket is empty.<br/>Browse our oven-fresh treats and add your favorites!
    </div>`;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmt = (subtotal * appliedDiscount) / 100;
  const total = subtotal - discountAmt;

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
      <div class="cart-item-details">
        <h4 style="font-size:0.9rem; font-weight:700">${item.title}</h4>
        <div style="font-size:0.85rem; color:var(--warm-gold); font-weight:700">$${item.price.toFixed(2)} each</div>
      </div>
      <div style="display:flex; align-items:center; gap:0.4rem">
        <button class="qty-btn" onclick="window.changeCartQty('${item.id}', -1)">-</button>
        <span style="font-weight:700; font-size:0.9rem; min-width:20px; text-align:center">${item.qty}</span>
        <button class="qty-btn" onclick="window.changeCartQty('${item.id}', 1)">+</button>
      </div>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

window.changeCartQty = function(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  updateCartBadge();
  renderCart();
};

function renderCheckoutSummary() {
  const summaryEl = document.getElementById('checkoutSummary');
  if (!summaryEl) return;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmt = (subtotal * appliedDiscount) / 100;
  const total = subtotal - discountAmt;

  summaryEl.innerHTML = `
    <div style="background:rgba(245,158,11,0.06); border:1px solid var(--glass-border); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem">
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.9rem">
        <span>Basket Items (${cart.reduce((a,b)=>a+b.qty,0)}):</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      ${appliedDiscount > 0 ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:#10b981; font-size:0.9rem">
          <span>Promo Code Discount (${appliedDiscount}%):</span>
          <span>-$${discountAmt.toFixed(2)}</span>
        </div>
      ` : ''}
      <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.15rem; color:var(--warm-gold); border-top:1px dashed var(--glass-border); padding-top:0.6rem">
        <span>Total Payable:</span>
        <span>$${total.toFixed(2)}</span>
      </div>
    </div>
  `;
}

// Live Order Tracker with Bakery Stepper Pipeline
function renderTracker() {
  const container = document.getElementById('trackerContent');
  if (!container) return;

  const user = (window.getCurrentUser ? window.getCurrentUser() : null) || { email: "customer@lyallpurbakers.com" };
  const orders = Store.getOrders().filter(o => o.customerEmail === user.email);

  if (orders.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-subtle)">No active bakery orders. Order fresh sourdough, sweets & pastries from our menu!</div>`;
    return;
  }

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const latestOrder = activeOrders[0] || orders[0];

  const steps = ['pending', 'baking', 'ready', 'delivered'];
  const statusIndex = steps.indexOf(latestOrder.status);

  container.innerHTML = `
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); border-radius:var(--radius-md); padding:1.5rem; margin-bottom:1.5rem">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem">
        <div>
          <h3 style="font-size:1.2rem; font-weight:700">Order ${latestOrder.id}</h3>
          <span style="font-size:0.8rem; color:var(--text-subtle)">Placed on ${new Date(latestOrder.createdAt).toLocaleString()}</span>
        </div>
        <span class="badge-status status-${latestOrder.status}">${latestOrder.status}</span>
      </div>

      <!-- 5-stage Baking Stepper -->
      <div class="status-stepper">
        <div class="step-node ${statusIndex >= 0 ? (statusIndex > 0 ? 'completed' : 'active') : ''}">
          <div class="step-circle">📝</div>
          <span class="step-label">Order Received</span>
        </div>
        <div class="step-node ${statusIndex >= 1 ? (statusIndex > 1 ? 'completed' : 'active') : ''}">
          <div class="step-circle">♨️</div>
          <span class="step-label">Oven Baking</span>
        </div>
        <div class="step-node ${statusIndex >= 2 ? (statusIndex > 2 ? 'completed' : 'active') : ''}">
          <div class="step-circle">📦</div>
          <span class="step-label">Oven Fresh Boxed</span>
        </div>
        <div class="step-node ${statusIndex >= 3 ? 'completed active' : ''}">
          <div class="step-circle">🚚</div>
          <span class="step-label">Delivered Hot</span>
        </div>
      </div>

      <div style="margin-top:1.5rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:1rem">
        <h4 style="font-size:0.9rem; font-weight:700; margin-bottom:0.5rem">Items in Order:</h4>
        ${latestOrder.items.map(i => `
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.35rem">
            <span>${i.qty}x ${i.title}</span>
            <span>$${(i.price * i.qty).toFixed(2)}</span>
          </div>
        `).join('')}
        <div style="display:flex; justify-content:space-between; font-weight:800; color:var(--warm-gold); margin-top:0.75rem; font-size:1rem; border-top:1px dashed rgba(255,255,255,0.1); padding-top:0.5rem">
          <span>Total Amount:</span>
          <span>$${latestOrder.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
}

// Order History & Printable Receipt Invoice
function renderOrderHistory() {
  const container = document.getElementById('orderHistoryTable');
  if (!container) return;

  const user = (window.getCurrentUser ? window.getCurrentUser() : null) || { email: "customer@lyallpurbakers.com" };
  const orders = Store.getOrders().filter(o => o.customerEmail === user.email);

  if (orders.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-subtle)">No past orders recorded yet.</td></tr>`;
    return;
  }

  container.innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${new Date(o.createdAt).toLocaleDateString()}</td>
      <td>$${o.total.toFixed(2)}</td>
      <td><span class="badge-status status-${o.status}">${o.status}</span></td>
      <td>
        <button class="btn-secondary btn-sm" onclick="window.viewReceipt('${o.id}')">🧾 Print Receipt</button>
      </td>
    </tr>
  `).join('');
}

window.viewReceipt = function(orderId) {
  const order = Store.getOrders().find(o => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById('receiptModal');
  const body = document.getElementById('receiptModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="printable-receipt">
      <div style="text-align:center; margin-bottom:1.25rem">
        <div class="receipt-stamp">★ Lyallpur Bakers Official Stamp ★</div>
        <h2 style="font-family:'Playfair Display', serif; font-size:1.6rem; font-weight:800; color:#29160c">Lyallpur Bakers</h2>
        <p style="font-size:0.8rem; color:#78350f; margin-top:0.15rem">Handcrafted Oven Bakes • Est. 1985</p>
        <div style="font-size:0.85rem; margin-top:0.5rem; color:#451a03">
          <strong>Invoice Order #${order.id}</strong><br/>
          <span>Date: ${new Date(order.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div style="margin-bottom:1rem; font-size:0.85rem; color:#451a03; border-top:1px solid #d97706; border-bottom:1px solid #d97706; padding:0.6rem 0">
        <div><strong>Customer:</strong> ${order.customerName}</div>
        <div><strong>Delivery Address:</strong> ${order.address}</div>
        <div><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:1rem; font-size:0.85rem; color:#29160c">
        <thead>
          <tr style="border-bottom:1px solid #d97706; text-align:left">
            <th style="padding:0.4rem 0">Bakery Item</th>
            <th style="padding:0.4rem 0">Qty</th>
            <th style="padding:0.4rem 0; text-align:right">Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(i => `
            <tr style="border-bottom:1px dashed #fde68a">
              <td style="padding:0.4rem 0">${i.title}</td>
              <td style="padding:0.4rem 0">${i.qty}</td>
              <td style="padding:0.4rem 0; text-align:right">$${(i.price * i.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="border-top:2px solid #d97706; padding-top:0.6rem; font-size:0.9rem; color:#29160c">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem">
          <span>Subtotal:</span>
          <span>$${order.subtotal.toFixed(2)}</span>
        </div>
        ${order.discountAmount > 0 ? `
          <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem; color:#059669; font-weight:700">
            <span>Promo Discount:</span>
            <span>-$${order.discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.15rem; color:#b45309; margin-top:0.4rem; border-top:1px solid #d97706; padding-top:0.4rem">
          <span>Total Paid:</span>
          <span>$${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div style="text-align:center; margin-top:1.25rem; font-size:0.75rem; color:#78350f">
        Thank you for ordering from Lyallpur Bakers! Baked fresh daily with love 🥐
      </div>
    </div>
  `;

  modal.classList.add('active');
};

if (document.getElementById('closeReceiptBtn')) {
  document.getElementById('closeReceiptBtn').addEventListener('click', () => {
    const modal = document.getElementById('receiptModal');
    if (modal) modal.classList.remove('active');
  });
}

function renderShopInfoBanner() {
  const info = Store.getShopInfo();
  if (document.getElementById('bannerShopName')) document.getElementById('bannerShopName').textContent = info.shopName || 'Lyallpur Bakers Main Branch';
  if (document.getElementById('bannerAddress')) document.getElementById('bannerAddress').textContent = info.address || 'Clock Tower Plaza, Lyallpur';
  if (document.getElementById('bannerHours')) document.getElementById('bannerHours').textContent = info.hours || '8:00 AM - 10:00 PM';
  if (document.getElementById('bannerPhone')) document.getElementById('bannerPhone').textContent = info.phone || '+1 (555) 019-9283';
  if (document.getElementById('bannerBakerName')) document.getElementById('bannerBakerName').textContent = info.shopkeeperName || 'Master Baker';
}
