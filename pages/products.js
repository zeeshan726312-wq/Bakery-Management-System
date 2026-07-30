// pages/products.js – Products page module
export function render() {
  const products = [
    { name: "Sourdough Bread", price: "$3.50", description: "Crusty artisan loaf." },
    { name: "Chocolate Croissant", price: "$2.20", description: "Flaky, buttery, chocolate‑filled." },
    { name: "Blueberry Muffin", price: "$1.80", description: "Soft muffin bursting with berries." }
  ];
  const itemsHtml = products.map(p => `
    <div class="card" style="margin-bottom:1rem;">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>${p.price}</strong></p>
    </div>`).join('');
  return `
    <section>
      <h1>Products</h1>
      ${itemsHtml}
    </section>
  `;
}
