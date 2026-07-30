// src/pages/delivery.js – Home Delivery management

const STORAGE_KEY = 'bms_deliveries';

function getDeliveries() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
function saveDeliveries(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); }
function getOrders() { return JSON.parse(localStorage.getItem('bms_orders') || '[]'); }

function renderTable() {
  const deliveries = getDeliveries();
  if (!deliveries.length) {
    return `<div class="empty-state"><div class="empty-icon">🚚</div><p>No deliveries scheduled yet.</p></div>`;
  }
  return `
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>#</th><th>Order</th><th>Address</th><th>Date</th><th>Time</th><th>Instructions</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${deliveries.map((d, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${d.orderLabel}</td>
              <td>${d.address}</td>
              <td>${d.date}</td>
              <td>${d.time}</td>
              <td>${d.instructions || '—'}</td>
              <td><span class="badge ${d.status === 'Delivered' ? 'badge-success' : 'badge-warning'}">${d.status}</span></td>
              <td>
                ${d.status !== 'Delivered' ? `<button class="btn btn-success btn-sm complete-delivery" data-id="${d.id}">Complete</button>` : ''}
                <button class="btn btn-danger btn-sm delete-delivery" data-id="${d.id}">Delete</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

export function render() {
  const orders = getOrders();

  return `
    <div class="page-header">
      <h1 class="page-title">Home Delivery</h1>
      <p class="page-subtitle">Manage delivery details for orders</p>
    </div>

    <div class="card">
      <h3 class="section-title">Schedule Delivery</h3>
      <form id="deliveryForm">
        <div class="form-group">
          <label for="delOrder">Order</label>
          <select id="delOrder" class="form-control" required>
            <option value="">Select Order</option>
            ${orders.map(o => `<option value="${o.id}" data-label="Order #${o.id} – ${o.customerName}">Order #${o.id} – ${o.customerName} (₹${o.amount})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="delAddress">Delivery Address</label>
          <input type="text" id="delAddress" class="form-control" placeholder="Enter Address of delivery" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="delDate">Delivery Date</label>
            <input type="date" id="delDate" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="delTime">Delivery Time</label>
            <input type="time" id="delTime" class="form-control" required />
          </div>
        </div>
        <div class="form-group">
          <label for="delInstructions">Delivery Instructions</label>
          <input type="text" id="delInstructions" class="form-control" placeholder="Enter Delivery Instructions" />
        </div>
        <button type="submit" class="btn btn-primary">Add Delivery</button>
      </form>
    </div>

    <div class="card">
      <h3 class="section-title">Deliveries</h3>
      <div id="deliveryTable">${renderTable()}</div>
    </div>
  `;
}

export function init() {
  document.getElementById('deliveryForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const orderSel = document.getElementById('delOrder');
    const deliveries = getDeliveries();
    deliveries.push({
      id: Date.now(),
      orderId:      orderSel.value,
      orderLabel:   orderSel.selectedOptions[0]?.dataset.label || '',
      address:      document.getElementById('delAddress').value.trim(),
      date:         document.getElementById('delDate').value,
      time:         document.getElementById('delTime').value,
      instructions: document.getElementById('delInstructions').value.trim(),
      status:       'Scheduled',
      createdAt:    new Date().toISOString(),
    });
    saveDeliveries(deliveries);
    document.getElementById('deliveryForm').reset();
    document.getElementById('deliveryTable').innerHTML = renderTable();
    bindActions();
  });
  bindActions();
}

function bindActions() {
  document.querySelectorAll('.complete-delivery').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const deliveries = getDeliveries();
      const idx = deliveries.findIndex(d => d.id === id);
      if (idx !== -1) { deliveries[idx].status = 'Delivered'; saveDeliveries(deliveries); }
      document.getElementById('deliveryTable').innerHTML = renderTable();
      bindActions();
    });
  });
  document.querySelectorAll('.delete-delivery').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this delivery?')) return;
      const id = parseInt(btn.dataset.id);
      saveDeliveries(getDeliveries().filter(d => d.id !== id));
      document.getElementById('deliveryTable').innerHTML = renderTable();
      bindActions();
    });
  });
}
