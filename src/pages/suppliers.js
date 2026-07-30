// src/pages/suppliers.js – Add Supplier

const STORAGE_KEY = 'bms_suppliers';

function getSuppliers() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
function saveSuppliers(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); }

function renderTable() {
  const suppliers = getSuppliers();
  if (!suppliers.length) {
    return `<div class="empty-state"><div class="empty-icon">🏭</div><p>No suppliers yet. Add your first supplier!</p></div>`;
  }
  return `
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>#</th><th>Phone</th><th>Name</th><th>Address</th><th>Date Added</th><th>Actions</th></tr></thead>
        <tbody>
          ${suppliers.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${s.phone}</td>
              <td>${s.name}</td>
              <td>${s.address}</td>
              <td>${new Date(s.createdAt).toLocaleDateString()}</td>
              <td><button class="btn btn-danger btn-sm delete-supplier" data-id="${s.id}">Delete</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

export function render() {
  return `
    <div class="page-header">
      <h1 class="page-title">Suppliers</h1>
      <p class="page-subtitle">Manage your supplier network</p>
    </div>

    <div class="card">
      <h3 class="section-title">Add Supplier</h3>
      <form id="supplierForm">
        <div class="form-row">
          <div class="form-group">
            <label for="supPhone">Supplier Phone</label>
            <input type="tel" id="supPhone" class="form-control" placeholder="Enter phone number" required />
          </div>
          <div class="form-group">
            <label for="supName">Supplier Name</label>
            <input type="text" id="supName" class="form-control" placeholder="Enter supplier name" required />
          </div>
          <div class="form-group">
            <label for="supAddress">Supplier Address</label>
            <input type="text" id="supAddress" class="form-control" placeholder="Enter the address" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Add Supplier</button>
      </form>
    </div>

    <div class="card">
      <h3 class="section-title">Supplier List</h3>
      <div id="supplierTable">${renderTable()}</div>
    </div>
  `;
}

export function init() {
  document.getElementById('supplierForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const suppliers = getSuppliers();
    suppliers.push({
      id: Date.now(),
      phone:   document.getElementById('supPhone').value.trim(),
      name:    document.getElementById('supName').value.trim(),
      address: document.getElementById('supAddress').value.trim(),
      createdAt: new Date().toISOString(),
    });
    saveSuppliers(suppliers);
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierTable').innerHTML = renderTable();
    bindDelete();
  });
  bindDelete();
}

function bindDelete() {
  document.querySelectorAll('.delete-supplier').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this supplier?')) return;
      const id = parseInt(btn.dataset.id);
      saveSuppliers(getSuppliers().filter(s => s.id !== id));
      document.getElementById('supplierTable').innerHTML = renderTable();
      bindDelete();
    });
  });
}
