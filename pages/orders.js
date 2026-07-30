// pages/orders.js – Orders page module
export function render() {
  const orders = [
    { id: "001", customer: "Alice", total: "$12.30", status: "Pending" },
    { id: "002", customer: "Bob", total: "$8.50", status: "Completed" },
    { id: "003", customer: "Charlie", total: "$15.20", status: "In Progress" }
  ];
  const rows = orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.customer}</td>
      <td>${o.total}</td>
      <td>${o.status}</td>
    </tr>`).join('');
  return `
    <section>
      <h1>Orders</h1>
      <table class="card" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </section>
  `;
}
