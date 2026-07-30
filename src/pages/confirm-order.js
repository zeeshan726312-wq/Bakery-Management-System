// src/pages/confirm-order.js – Confirm pending orders

function getOrders()   { return JSON.parse(localStorage.getItem('bms_orders') || '[]'); }
function saveOrders(l) { localStorage.setItem('bms_orders', JSON.stringify(l)); }

export function render() {
  const pending = getOrders().filter(o => o.status === 'Pending');

  return `
    <div class="page-header">
      <h1 class="page-title">Confirm Order</h1>
      <p class="page-subtitle">Finalize order details and payment</p>
    </div>

    ${pending.length ? pending.map(o => `
      <div class="card confirm-card" data-order-id="${o.id}">
        <h3 style="margin-bottom:0.25rem;">Customer: ${o.customerName}</h3>
        <p style="color:var(--text-secondary);margin-bottom:0.25rem;"><strong>Order# ${o.id}</strong></p>
        <p style="color:var(--text-secondary);margin-bottom:1rem;">Order Amount: <strong style="color:var(--text-primary);">₹${parseFloat(o.amount).toLocaleString()}</strong></p>

        <div class="form-group">
          <label>Delivery Mode</label>
          <select class="form-control conf-delivery">
            <option value="">Select Delivery Mode</option>
            <option value="Home Delivery">Home Delivery</option>
            <option value="Pickup">Pickup</option>
            <option value="Dine-in">Dine-in</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Extra Charge (₹)</label>
            <input type="number" class="form-control conf-extra" value="0" min="0" />
          </div>
          <div class="form-group">
            <label>Payment Method</label>
            <select class="form-control conf-payment">
              <option value="">Select Payment Mode</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Online">Online</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Comments</label>
          <input type="text" class="form-control conf-comments" placeholder="Enter Comments" />
        </div>
        <button class="btn btn-success confirm-btn" data-id="${o.id}">Confirm Order</button>
      </div>`).join('') : `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <p>No pending orders to confirm. All orders are up to date!</p>
        </div>
      </div>`}
  `;
}

export function init() {
  document.querySelectorAll('.confirm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = parseInt(btn.dataset.id);
      const card = btn.closest('.confirm-card');
      const deliveryMode  = card.querySelector('.conf-delivery').value;
      const extraCharge   = card.querySelector('.conf-extra').value;
      const paymentMethod = card.querySelector('.conf-payment').value;
      const comments      = card.querySelector('.conf-comments').value;

      if (!deliveryMode || !paymentMethod) {
        alert('Please select delivery mode and payment method.');
        return;
      }

      const orders = getOrders();
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        orders[idx].status       = 'Confirmed';
        orders[idx].deliveryMode = deliveryMode;
        orders[idx].extraCharge  = extraCharge;
        orders[idx].paymentMethod = paymentMethod;
        orders[idx].comments     = comments;
        orders[idx].confirmedAt  = new Date().toISOString();
        saveOrders(orders);
      }

      // Re-render
      document.getElementById('app').innerHTML = render();
      init();
    });
  });
}
