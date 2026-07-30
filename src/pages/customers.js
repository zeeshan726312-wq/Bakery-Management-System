// src/pages/customers.js – Add New Customer

const STORAGE_KEY = 'bms_customers';

function getCustomers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
function saveCustomers(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderTable() {
  const customers = getCustomers();
  if (!customers.length) {
    return `<div class="empty-state"><div class="empty-icon">👥</div><p>No customers yet. Add your first customer above!</p></div>`;
  }
  return `
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>#</th><th>Contact</th><th>Name</th><th>Address</th><th>Actions</th></tr></thead>
        <tbody>
          ${customers.map((c, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${c.contact}</td>
              <td>${c.firstName} ${c.lastName}</td>
              <td>${c.address}</td>
              <td><button class="btn btn-danger btn-sm delete-customer" data-id="${c.id}">Delete</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

export function render() {
  return `
    <div class="page-header">
      <h1 class="page-title">Customers</h1>
      <p class="page-subtitle">Manage your customer database</p>
    </div>

    <div class="card">
      <h3 class="section-title">Add New Customer</h3>
      <form id="customerForm">
        <div class="form-group">
          <label for="custContact">Contact</label>
          <input type="tel" id="custContact" class="form-control" placeholder="8821219072" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="custFirst">First Name</label>
            <input type="text" id="custFirst" class="form-control" placeholder="Enter First Name" required />
          </div>
          <div class="form-group">
            <label for="custLast">Last Name</label>
            <input type="text" id="custLast" class="form-control" placeholder="Enter Last Name" required />
          </div>
        </div>
        <div class="form-group">
          <label for="custAddress">Address</label>
          <input type="text" id="custAddress" class="form-control" placeholder="Enter Address" required />
        </div>
        <button type="submit" class="btn btn-primary">Add Customer</button>
      </form>
    </div>

    <div class="card" id="customerTableCard">
      <h3 class="section-title">Customer List</h3>
      <div id="customerTable">${renderTable()}</div>
    </div>
  `;
}

export function init() {
  document.getElementById('customerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const customers = getCustomers();
    customers.push({
      id: Date.now(),
      contact:   document.getElementById('custContact').value.trim(),
      firstName: document.getElementById('custFirst').value.trim(),
      lastName:  document.getElementById('custLast').value.trim(),
      address:   document.getElementById('custAddress').value.trim(),
      createdAt: new Date().toISOString(),
    });
    saveCustomers(customers);
    document.getElementById('customerForm').reset();
    document.getElementById('customerTable').innerHTML = renderTable();
    bindDeleteButtons();
  });
  bindDeleteButtons();
}

function bindDeleteButtons() {
  document.querySelectorAll('.delete-customer').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this customer?')) return;
      const id = parseInt(btn.dataset.id);
      saveCustomers(getCustomers().filter(c => c.id !== id));
      document.getElementById('customerTable').innerHTML = renderTable();
      bindDeleteButtons();
    });
  });
}
