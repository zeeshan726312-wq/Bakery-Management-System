// src/pages/orders.js – Take / manage orders

const STORAGE_KEY = 'bms_orders';

function getOrders()    { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
function saveOrders(l)  { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); }
function getCustomers() { return JSON.parse(localStorage.getItem('bms_customers') || '[]'); }
function getProducts()  { return JSON.parse(localStorage.getItem('bms_products')  || '[]'); }

function renderTable() {
  const orders = getOrders();
  if (!orders.length) {
    return `<div class="empty-state"><div class="empty-icon">📦</div><p>No orders yet. Create your first order!</p></div>`;
  }
  return `
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>Order #</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td>#${o.id}</td>
              <td>${o.customerName}</td>
              <td>${o.productName}</td>
              <td>${o.quantity}</td>
              <td>₹${parseFloat(o.amount).toLocaleString()}</td>
              <td>${o.date}</td>
              <td><span class="badge ${o.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
              <td>
                ${o.status === 'Pending' ? `<a href="#confirm-order" class="btn btn-success btn-sm">Confirm</a>` : ''}
                <button class="btn btn-danger btn-sm delete-order" data-id="${o.id}">Delete</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

export function render() {
  const customers = getCustomers();
  const products  = getProducts();

  return `
    <div class="page-header">
      <h1 class="page-title">Orders</h1>
      <p class="page-subtitle">Create and manage customer orders</p>
    </div>

    <div class="card">
      <h3 class="section-title">Create New Order</h3>
      <form id="orderForm">
        <div class="form-row">
          <div class="form-group">
            <label for="orderCustomer">Customer</label>
            <select id="orderCustomer" class="form-control" required>
              <option value="">Select Customer</option>
              ${customers.map(c => `<option value="${c.id}" data-name="${c.firstName} ${c.lastName}">${c.firstName} ${c.lastName} (${c.contact})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="orderProduct">Product</label>
            <select id="orderProduct" class="form-control" required>
              <option value="">Select Product</option>
              ${products.map(p => `<option value="${p.id}" data-name="${p.name}" data-price="${p.price}">${p.name} – ₹${p.price}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="orderQty">Quantity</label>
            <input type="number" id="orderQty" class="form-control" value="1" min="1" required />
          </div>
          <div class="form-group">
            <label for="orderAmount">Order Amount (₹)</label>
            <input type="text" id="orderAmount" class="form-control" readonly placeholder="Auto-calculated" />
          </div>
          <div class="form-group">
            <label for="orderDate">Order Date</label>
            <input type="date" id="orderDate" class="form-control" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Add Order</button>
      </form>
    </div>

    <div class="card">
      <h3 class="section-title">All Orders</h3>
      <div id="orderTable">${renderTable()}</div>
    </div>
  `;
}

export function init() {
  // Default date to today
  const dateInput = document.getElementById('orderDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  // Auto-calculate amount
  function calcAmount() {
    const prodSelect = document.getElementById('orderProduct');
    const qty = parseInt(document.getElementById('orderQty')?.value) || 1;
    const selected = prodSelect?.selectedOptions[0];
    const price = parseFloat(selected?.dataset.price) || 0;
    const amountField = document.getElementById('orderAmount');
    if (amountField) amountField.value = (price * qty).toFixed(2);
  }
  document.getElementById('orderProduct')?.addEventListener('change', calcAmount);
  document.getElementById('orderQty')?.addEventListener('input', calcAmount);

  // Form submit
  document.getElementById('orderForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const custSelect = document.getElementById('orderCustomer');
    const prodSelect = document.getElementById('orderProduct');
    const orders = getOrders();
    orders.push({
      id: Date.now(),
      customerId:   custSelect.value,
      customerName: custSelect.selectedOptions[0]?.dataset.name || '',
      productId:    prodSelect.value,
      productName:  prodSelect.selectedOptions[0]?.dataset.name || '',
      quantity:     document.getElementById('orderQty').value,
      amount:       document.getElementById('orderAmount').value,
      date:         document.getElementById('orderDate').value,
      status:       'Pending',
      createdAt:    new Date().toISOString(),
    });
    saveOrders(orders);
    document.getElementById('orderForm').reset();
    document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('orderTable').innerHTML = renderTable();
    bindDelete();
  });
  bindDelete();
}

function bindDelete() {
  document.querySelectorAll('.delete-order').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this order?')) return;
      const id = parseInt(btn.dataset.id);
      saveOrders(getOrders().filter(o => o.id !== id));
      document.getElementById('orderTable').innerHTML = renderTable();
      bindDelete();
    });
  });
}
