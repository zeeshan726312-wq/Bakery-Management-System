// src/pages/supply-orders.js – Supply Order tracking

const STORAGE_KEY = 'bms_supply_orders';

function getSupplyOrders() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
function saveSupplyOrders(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); }
function getSuppliers() { return JSON.parse(localStorage.getItem('bms_suppliers') || '[]'); }

function renderTable() {
  const orders = getSupplyOrders();
  if (!orders.length) {
    return `<div class="empty-state"><div class="empty-icon">📋</div><p>No supply orders yet.</p></div>`;
  }
  return `
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>#</th><th>Supplier</th><th>Invoice #</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${orders.map((o, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${o.supplierName}</td>
              <td>${o.invoiceNumber}</td>
              <td>₹${parseFloat(o.amount).toLocaleString()}</td>
              <td>${o.date}</td>
              <td><span class="badge ${o.status === 'Received' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
              <td>
                ${o.status !== 'Received' ? `<button class="btn btn-success btn-sm receive-so" data-id="${o.id}">Mark Received</button>` : ''}
                <button class="btn btn-danger btn-sm delete-so" data-id="${o.id}">Delete</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

export function render() {
  const suppliers = getSuppliers();

  return `
    <div class="page-header">
      <h1 class="page-title">Supply Orders</h1>
      <p class="page-subtitle">Track orders placed with suppliers</p>
    </div>

    <div class="card">
      <h3 class="section-title">Add Details of Supply Order Given</h3>
      <form id="supplyOrderForm">
        <div class="form-group">
          <label for="soSupplier">Supplier</label>
          <select id="soSupplier" class="form-control" required>
            <option value="">-----------</option>
            ${suppliers.map(s => `<option value="${s.id}" data-name="${s.name}">${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="soInvoice">Invoice Number</label>
          <input type="text" id="soInvoice" class="form-control" placeholder="Enter Receipt Number" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="soAmount">Total Amount (₹)</label>
            <input type="number" id="soAmount" class="form-control" placeholder="0" min="0" step="0.01" required />
          </div>
          <div class="form-group">
            <label for="soDate">Order Date</label>
            <input type="date" id="soDate" class="form-control" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Add Order</button>
      </form>
    </div>

    <div class="card">
      <h3 class="section-title">Supply Order History</h3>
      <div id="supplyOrderTable">${renderTable()}</div>
    </div>
  `;
}

export function init() {
  const dateInput = document.getElementById('soDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  document.getElementById('supplyOrderForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const supSelect = document.getElementById('soSupplier');
    const orders = getSupplyOrders();
    orders.push({
      id: Date.now(),
      supplierId:   supSelect.value,
      supplierName: supSelect.selectedOptions[0]?.dataset.name || '',
      invoiceNumber: document.getElementById('soInvoice').value.trim(),
      amount:       document.getElementById('soAmount').value,
      date:         document.getElementById('soDate').value,
      status:       'Pending',
      createdAt:    new Date().toISOString(),
    });
    saveSupplyOrders(orders);
    document.getElementById('supplyOrderForm').reset();
    document.getElementById('soDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('supplyOrderTable').innerHTML = renderTable();
    bindActions();
  });
  bindActions();
}

function bindActions() {
  document.querySelectorAll('.receive-so').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const orders = getSupplyOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx !== -1) { orders[idx].status = 'Received'; saveSupplyOrders(orders); }
      document.getElementById('supplyOrderTable').innerHTML = renderTable();
      bindActions();
    });
  });
  document.querySelectorAll('.delete-so').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this supply order?')) return;
      const id = parseInt(btn.dataset.id);
      saveSupplyOrders(getSupplyOrders().filter(o => o.id !== id));
      document.getElementById('supplyOrderTable').innerHTML = renderTable();
      bindActions();
    });
  });
}
