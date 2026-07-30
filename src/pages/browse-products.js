// src/pages/browse-products.js – Customer browses & orders products

function getProducts() { return JSON.parse(localStorage.getItem('bms_products') || '[]'); }
function getOrders()   { return JSON.parse(localStorage.getItem('bms_orders') || '[]'); }
function saveOrders(l) { localStorage.setItem('bms_orders', JSON.stringify(l)); }

export function render() {
  const products = getProducts();

  return `
    <div class="page-header">
      <h1 class="page-title">Browse Products</h1>
      <p class="page-subtitle">Explore our bakery items and place an order</p>
    </div>

    ${products.length ? `
    <div class="products-grid">
      ${products.map(p => `
        <div class="product-card">
          <div class="product-name">${p.name}</div>
          <span class="badge badge-info">${p.category}</span>
          <div class="product-price">₹${parseFloat(p.price).toLocaleString()}</div>
          <p style="color:var(--text-secondary);font-size:0.85rem;margin:0.5rem 0;">In stock: ${p.stock}</p>
          <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--glass-border);">
            <input type="number" class="form-control order-qty" data-product-id="${p.id}" data-name="${p.name}" data-price="${p.price}" value="1" min="1" max="${p.stock}" style="width:70px;padding:0.4rem 0.5rem;" />
            <button class="btn btn-success btn-sm order-btn" data-product-id="${p.id}">Order Now</button>
          </div>
        </div>`).join('')}
    </div>` : `
    <div class="card">
      <div class="empty-state">
        <div class="empty-icon">🧁</div>
        <p>No products available yet. The shopkeeper hasn't added any items.</p>
      </div>
    </div>`}

    <div id="orderMessage" style="display:none;margin-top:1rem;"></div>
  `;
}

export function init() {
  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      const card = btn.closest('.product-card');
      const qtyInput = card.querySelector('.order-qty');
      const qty = parseInt(qtyInput.value) || 1;
      const name = qtyInput.dataset.name;
      const price = parseFloat(qtyInput.dataset.price);
      const amount = (price * qty).toFixed(2);

      const orders = getOrders();
      orders.push({
        id: Date.now(),
        customerId:   'customer',
        customerName: 'Customer',
        productId:    productId,
        productName:  name,
        quantity:     qty,
        amount:       amount,
        date:         new Date().toISOString().split('T')[0],
        status:       'Pending',
        placedBy:     'customer',
        createdAt:    new Date().toISOString(),
      });
      saveOrders(orders);

      // Show success message
      const msgEl = document.getElementById('orderMessage');
      msgEl.innerHTML = `<div class="card" style="border-left:3px solid hsl(145,65%,42%);animation:fadeInUp 0.3s ease;">
        <p>✅ <strong>Order placed!</strong> ${qty}× ${name} — ₹${parseFloat(amount).toLocaleString()}</p>
      </div>`;
      msgEl.style.display = 'block';
      setTimeout(() => { msgEl.style.display = 'none'; }, 3000);

      // Change button text temporarily
      btn.textContent = '✓ Ordered!';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = 'Order Now'; btn.disabled = false; }, 2000);
    });
  });
}
