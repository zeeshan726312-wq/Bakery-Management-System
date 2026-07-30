// src/app.js – SPA Router + Theme + Sidebar logic
import { applyTheme } from './theme.js';

// ── Page modules (static imports for Vite) ──
import * as dashboard    from './pages/dashboard.js';
import * as customers    from './pages/customers.js';
import * as products     from './pages/products.js';
import * as orders       from './pages/orders.js';
import * as confirmOrder from './pages/confirm-order.js';
import * as delivery     from './pages/delivery.js';
import * as suppliers    from './pages/suppliers.js';
import * as supplyOrders from './pages/supply-orders.js';
import * as settings     from './pages/settings.js';

const routes = {
  '#dashboard':     dashboard,
  '#customers':     customers,
  '#products':      products,
  '#orders':        orders,
  '#confirm-order': confirmOrder,
  '#delivery':      delivery,
  '#suppliers':     suppliers,
  '#supply-orders': supplyOrders,
  '#settings':      settings,
  '':               dashboard,   // default
};

// ── Router ───────────────────────────────────
function updateNav(hash) {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  });
}

function renderRoute() {
  const hash = window.location.hash || '#dashboard';
  updateNav(hash);
  const pageModule = routes[hash] || routes['#dashboard'];
  const app = document.getElementById('app');
  try {
    app.innerHTML = pageModule.render();
    if (typeof pageModule.init === 'function') {
      pageModule.init();
    }
  } catch (e) {
    console.error('Page render error:', e);
    app.innerHTML = `
      <div class="page-header"><h1 class="page-title">Error</h1></div>
      <div class="card"><p>Failed to load page: ${e.message}</p></div>`;
  }

  // Close sidebar on mobile after navigation
  document.getElementById('sidebar')?.classList.remove('open');
}

window.addEventListener('hashchange', renderRoute);
renderRoute();

// ── Theme selector ───────────────────────────
const themeSelect = document.getElementById('themeSelect');
if (themeSelect) {
  const saved = localStorage.getItem('bms_theme');
  if (saved) {
    applyTheme(saved);
    themeSelect.value = saved;
  }
  themeSelect.addEventListener('change', (e) => {
    applyTheme(e.target.value);
    localStorage.setItem('bms_theme', e.target.value);
  });
}

// ── Mobile sidebar toggle ────────────────────
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}
