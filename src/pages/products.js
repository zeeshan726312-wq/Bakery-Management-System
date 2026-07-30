// src/pages/products.js – Products management

const STORAGE_KEY = 'bms_products';

function getProducts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
function saveProducts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderGrid() {
  const products = getProducts();
  if (!products.length) {
    return `<div class="empty-state"><div class="empty-icon">🧁</div><p>No products yet. Add your first bakery product!</p></div>`;
  }
  return `
    <div class="products-grid">
      ${products.map(p => `
        <div class="product-card">
          <div class="product-name">${p.name}</div>
          <span class="badge badge-info">${p.category}</span>
          <div class="product-price">₹${parseFloat(p.price).toLocaleString()}</div>
          <div class="product-meta">
            <span style="color:var(--text-secondary);font-size:0.85rem;">Stock: ${p.stock}</span>
            <button class="btn btn-danger btn-sm delete-product" data-id="${p.id}">Delete</button>
          </div>
        </div>`).join('')}
    </div>`;
}

export function render() {
  return `
    <div class="page-header">
      <h1 class="page-title">Products</h1>
      <p class="page-subtitle">Manage bakery products & inventory</p>
    </div>

    <div class="card">
      <h3 class="section-title">Add New Product</h3>
      <form id="productForm">
        <div class="form-row">
          <div class="form-group">
            <label for="prodName">Product Name</label>
            <input type="text" id="prodName" class="form-control" placeholder="e.g. Chocolate Cake" required />
          </div>
          <div class="form-group">
            <label for="prodCategory">Category</label>
            <select id="prodCategory" class="form-control" required>
              <option value="">Select Category</option>
              <option value="Bread">Bread</option>
              <option value="Cake">Cake</option>
              <option value="Pastry">Pastry</option>
              <option value="Cookie">Cookie</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="prodPrice">Price (₹)</label>
            <input type="number" id="prodPrice" class="form-control" placeholder="0" min="0" step="0.01" required />
          </div>
          <div class="form-group">
            <label for="prodStock">Stock Quantity</label>
            <input type="number" id="prodStock" class="form-control" placeholder="0" min="0" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Add Product</button>
      </form>
    </div>

    <div class="card">
      <h3 class="section-title">Product Catalog</h3>
      <div id="productGrid">${renderGrid()}</div>
    </div>
  `;
}

export function init() {
  document.getElementById('productForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const products = getProducts();
    products.push({
      id: Date.now(),
      name:     document.getElementById('prodName').value.trim(),
      category: document.getElementById('prodCategory').value,
      price:    document.getElementById('prodPrice').value,
      stock:    document.getElementById('prodStock').value,
      createdAt: new Date().toISOString(),
    });
    saveProducts(products);
    document.getElementById('productForm').reset();
    document.getElementById('productGrid').innerHTML = renderGrid();
    bindDeleteButtons();
  });
  bindDeleteButtons();
}

function bindDeleteButtons() {
  document.querySelectorAll('.delete-product').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this product?')) return;
      const id = parseInt(btn.dataset.id);
      saveProducts(getProducts().filter(p => p.id !== id));
      document.getElementById('productGrid').innerHTML = renderGrid();
      bindDeleteButtons();
    });
  });
}
