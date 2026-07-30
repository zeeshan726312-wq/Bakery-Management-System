// app.js – Simple SPA router and page loader

// Define route-to-module mapping
const routes = {
  "#home": "./pages/home.js",
  "#products": "./pages/products.js",
  "#orders": "./pages/orders.js",
  "#about": "./pages/about.js",
  "": "./pages/home.js" // default route
};

// Utility to set active nav link
function updateNav(activeHash) {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === activeHash);
  });
}

// Render a page module's content into #app
async function renderRoute() {
  const hash = window.location.hash || "#home";
  updateNav(hash);
  const modulePath = routes[hash] || routes["#home"];
  try {
    const pageModule = await import(modulePath);
    const html = pageModule.render();
    document.getElementById('app').innerHTML = html;
  } catch (e) {
    console.error('Failed to load page', e);
    document.getElementById('app').innerHTML = `<div class="card"><h2>Error loading page</h2><p>${e}</p></div>`;
  }
}

// Listen for hash changes
window.addEventListener('hashchange', renderRoute);
// Initial render
renderRoute();
