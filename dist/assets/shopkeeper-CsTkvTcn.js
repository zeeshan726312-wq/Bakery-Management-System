import"./auth-DGG0_UAO.js";import{S as r}from"./store-DbBK5EXH.js";document.addEventListener("DOMContentLoaded",()=>{let e=window.getCurrentUser?window.getCurrentUser():JSON.parse(localStorage.getItem("currentUser"));(!e||e.role!=="shopkeeper"&&e.role!=="admin")&&(e={name:"Master Baker",email:"shopkeeper@laylpurbakery.com",role:"shopkeeper"},window.Auth&&window.Auth.setCurrentUser?window.Auth.setCurrentUser(e):localStorage.setItem("currentUser",JSON.stringify(e)));const o=document.getElementById("userName"),t=document.getElementById("userNameHeader");o&&(o.textContent=e.name),t&&(t.textContent=e.name),y(),I(),B(),A(),T(),U(),h(),L()});function L(){document.querySelectorAll(".tab-btn").forEach(i=>{i.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(n=>n.style.display="none"),i.classList.add("active");const d=i.getAttribute("data-target");document.getElementById(d)&&(document.getElementById(d).style.display="block")})});const e=document.getElementById("openAddProductBtn"),o=document.getElementById("addProductModal"),t=document.getElementById("closeAddProductBtn");e&&o&&e.addEventListener("click",()=>o.classList.add("active")),t&&o&&t.addEventListener("click",()=>o.classList.remove("active"));const a=document.getElementById("prodImgFile"),l=document.getElementById("prodImgUrl"),s=document.getElementById("imgPreview");a&&a.addEventListener("change",i=>{const d=i.target.files[0];if(d){const n=new FileReader;n.onload=m=>{s&&(s.src=m.target.result,s.style.display="block")},n.readAsDataURL(d)}}),l&&l.addEventListener("input",()=>{l.value.trim()&&s&&(s.src=l.value.trim(),s.style.display="block")});const u=document.getElementById("addProductForm");u&&u.addEventListener("submit",i=>{i.preventDefault();const d=document.getElementById("prodTitle").value.trim(),n=document.getElementById("prodCategory").value,m=parseFloat(document.getElementById("prodPrice").value),p=parseInt(document.getElementById("prodStock").value),g=parseInt(document.getElementById("prodDiscount").value)||0,f=document.getElementById("prodDesc").value.trim();let S=s&&s.style.display!=="none"?s.src:document.getElementById("prodImgUrl").value.trim()||"https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80";r.addProduct({title:d,category:n,price:m,stock:p,discount:g,description:f,image:S}),window.Auth&&window.Auth.showToast&&window.Auth.showToast(`Product "${d}" published! Visible to customers now.`,"success"),u.reset(),s&&(s.style.display="none"),o&&o.classList.remove("active"),y(),h()});const w=document.getElementById("openAddUserBtn"),c=document.getElementById("addUserModal"),$=document.getElementById("closeAddUserBtn");w&&c&&w.addEventListener("click",()=>c.classList.add("active")),$&&c&&$.addEventListener("click",()=>c.classList.remove("active"));const v=document.getElementById("addUserForm");v&&v.addEventListener("submit",i=>{i.preventDefault();const d=document.getElementById("newUserName").value.trim(),n=document.getElementById("newUserEmail").value.trim().toLowerCase(),m=document.getElementById("newUserPassword").value,p=document.getElementById("newUserRole").value,g=window.Auth&&window.Auth.getUsers?window.Auth.getUsers():JSON.parse(localStorage.getItem("users")||"[]");if(g.some(f=>f.email.toLowerCase()===n)){window.Auth&&window.Auth.showToast&&window.Auth.showToast("User email already exists.","error");return}g.push({name:d,email:n,password:m,role:p}),window.Auth&&window.Auth.saveUsers&&window.Auth.saveUsers(g),window.Auth&&window.Auth.showToast&&window.Auth.showToast(`User ${d} (${p.toUpperCase()}) added!`,"success"),v.reset(),c&&c.classList.remove("active"),A()});const b=document.getElementById("addDiscountForm");b&&b.addEventListener("submit",i=>{i.preventDefault();const d=document.getElementById("discCode").value.trim(),n=document.getElementById("discPercent").value,m=document.getElementById("discMinSpend").value;r.addDiscount({code:d,discountPercent:n,minSpend:m}),window.Auth&&window.Auth.showToast&&window.Auth.showToast(`Promo code ${d.toUpperCase()} created!`,"success"),b.reset(),T()});const E=document.getElementById("resetSystemBtn");E&&E.addEventListener("click",()=>{confirm("Are you sure you want to reset all products, orders, and feedback back to initial default values?")&&(r.resetStore(),window.Auth&&window.Auth.showToast&&window.Auth.showToast("Store data re-seeded successfully!","success"),setTimeout(()=>window.location.reload(),800))});const k=document.getElementById("exportDataBtn");k&&k.addEventListener("click",()=>{const i={users:window.Auth&&window.Auth.getUsers?window.Auth.getUsers():JSON.parse(localStorage.getItem("users")||"[]"),products:r.getProducts(),orders:r.getOrders(),discounts:r.getDiscounts(),feedbacks:r.getFeedbacks()},d="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(i,null,2)),n=document.createElement("a");n.setAttribute("href",d),n.setAttribute("download",`laylpur_bakery_backup_${new Date().toISOString().split("T")[0]}.json`),document.body.appendChild(n),n.click(),n.remove(),window.Auth&&window.Auth.showToast&&window.Auth.showToast("Backup JSON file downloaded!","success")})}function y(){const e=document.getElementById("shopProductsTable");if(!e)return;const o=r.getProducts();if(o.length===0){e.innerHTML='<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-subtle)">No bakery products added yet. Click "+ Add New Bakery Item" above!</td></tr>';return}e.innerHTML=o.map(t=>`
    <tr>
      <td>
        <img src="${t.image}" alt="${t.title}" style="width:45px; height:45px; border-radius:8px; object-fit:cover" onerror="this.src='https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'" />
      </td>
      <td><strong>${t.title}</strong></td>
      <td><span class="product-tag" style="position:static">${t.category}</span></td>
      <td>$${t.price.toFixed(2)}</td>
      <td>
        <span style="font-weight:700; color:${t.stock<10?"#ef4444":"#10b981"}">${t.stock} units</span>
      </td>
      <td>${t.discount>0?`<span style="color:#f59e0b; font-weight:700">-${t.discount}%</span>`:"0%"}</td>
      <td>
        <button class="btn-secondary btn-sm" onclick="window.editStockPrompt('${t.id}', ${t.stock})">✏️ Stock</button>
        <button class="btn-danger btn-sm" onclick="window.deleteProductPrompt('${t.id}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join("")}window.editStockPrompt=function(e,o){const t=prompt("Update inventory stock quantity for product:",o);t!==null&&!isNaN(t)&&(r.updateProduct(e,{stock:parseInt(t)}),window.Auth&&window.Auth.showToast&&window.Auth.showToast("Stock level updated!","success"),y(),h())};window.deleteProductPrompt=function(e){confirm("Are you sure you want to delete this bakery item from the menu?")&&(r.deleteProduct(e),window.Auth&&window.Auth.showToast&&window.Auth.showToast("Product deleted from bakery catalog.","info"),y(),h())};function I(){const e=document.getElementById("shopOrderQueue");if(!e)return;const o=r.getOrders();if(o.length===0){e.innerHTML='<div style="text-align:center; padding:2rem; color:var(--text-subtle)">No customer orders in queue right now.</div>';return}e.innerHTML=o.map(t=>`
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1.25rem; border-radius:var(--radius-md); margin-bottom:1rem">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem">
        <div>
          <strong style="font-size:1.1rem">Order #${t.id}</strong>
          <span style="font-size:0.85rem; color:var(--text-subtle); margin-left:0.5rem">by ${t.customerName} (${t.phone})</span>
        </div>
        <span class="badge-status status-${t.status}">${t.status}</span>
      </div>

      <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem">
        📍 <strong>Delivery Address:</strong> ${t.address} | 💳 <strong>Payment:</strong> ${t.paymentMethod} ($${t.total.toFixed(2)})
      </div>

      <div style="background:rgba(0,0,0,0.2); padding:0.75rem; border-radius:8px; margin-bottom:0.75rem">
        ${t.items.map(a=>`<div style="font-size:0.85rem">${a.qty}x ${a.title} - $${(a.price*a.qty).toFixed(2)}</div>`).join("")}
      </div>

      <div style="display:flex; gap:0.5rem; flex-wrap:wrap">
        ${t.status==="pending"?`
          <button class="btn-primary btn-sm" onclick="window.updateOrderStatus('${t.id}', 'baking')">🔥 Start Baking</button>
          <button class="btn-danger btn-sm" onclick="window.updateOrderStatus('${t.id}', 'cancelled')">✕ Reject Order</button>
        `:""}
        ${t.status==="baking"?`
          <button class="btn-primary btn-sm" style="background:#a855f7" onclick="window.updateOrderStatus('${t.id}', 'ready')">✨ Mark Oven Ready</button>
        `:""}
        ${t.status==="ready"?`
          <button class="btn-primary btn-sm" style="background:#10b981" onclick="window.updateOrderStatus('${t.id}', 'delivered')">🚴 Out for Delivery / Picked Up</button>
        `:""}
      </div>
    </div>
  `).join("")}window.updateOrderStatus=function(e,o){r.updateOrderStatus(e,o),window.Auth&&window.Auth.showToast&&window.Auth.showToast(`Order #${e} marked as ${o.toUpperCase()}!`,"success"),I(),B()};function B(){const e=document.getElementById("salesReportContent");if(!e)return;const o=r.getOrders(),t=o.filter(s=>s.status==="delivered"),a=t.reduce((s,u)=>s+u.total,0),l=t.length>0?a/t.length:0;e.innerHTML=`
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem">
      <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:var(--radius-md)">
        <div style="font-size:0.75rem; color:var(--text-subtle)">TOTAL STORE REVENUE</div>
        <div style="font-size:1.5rem; font-weight:800; color:var(--amber-primary)">$${a.toFixed(2)}</div>
      </div>
      <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:var(--radius-md)">
        <div style="font-size:0.75rem; color:var(--text-subtle)">AVERAGE ORDER VALUE</div>
        <div style="font-size:1.5rem; font-weight:800">$${l.toFixed(2)}</div>
      </div>
      <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:var(--radius-md)">
        <div style="font-size:0.75rem; color:var(--text-subtle)">COMPLETED DELIVERIES</div>
        <div style="font-size:1.5rem; font-weight:800; color:#10b981">${t.length} Orders</div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Items</th>
            <th>Payment</th>
            <th>Total Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${o.map(s=>`
            <tr>
              <td><strong>${s.id}</strong></td>
              <td>${s.customerName}</td>
              <td>${s.items.length} items</td>
              <td>${s.paymentMethod}</td>
              <td>$${s.total.toFixed(2)}</td>
              <td><span class="badge-status status-${s.status}">${s.status}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `}function A(){const e=document.getElementById("shopUsersTable");if(!e)return;const o=window.Auth&&window.Auth.getUsers?window.Auth.getUsers():JSON.parse(localStorage.getItem("users")||"[]");e.innerHTML=o.map((t,a)=>`
    <tr>
      <td><strong>${t.name}</strong></td>
      <td>${t.email}</td>
      <td><span class="role-badge badge-${t.role}">${t.role}</span></td>
      <td>
        <button class="btn-danger btn-sm" onclick="window.deleteUserPrompt('${t.email}')">🗑️ Remove</button>
      </td>
    </tr>
  `).join("")}window.deleteUserPrompt=function(e){const o=window.getCurrentUser?window.getCurrentUser():null;if(o&&o.email.toLowerCase()===e.toLowerCase()){window.Auth&&window.Auth.showToast&&window.Auth.showToast("You cannot delete your own active account!","error");return}if(confirm(`Are you sure you want to remove user account (${e})?`)){const t=(window.Auth&&window.Auth.getUsers?window.Auth.getUsers():JSON.parse(localStorage.getItem("users")||"[]")).filter(a=>a.email.toLowerCase()!==e.toLowerCase());window.Auth&&window.Auth.saveUsers&&window.Auth.saveUsers(t),window.Auth&&window.Auth.showToast&&window.Auth.showToast("User removed successfully.","info"),A()}};function T(){const e=document.getElementById("shopDiscountsTable");if(!e)return;const o=r.getDiscounts();e.innerHTML=o.map(t=>`
    <tr>
      <td><strong style="color:var(--amber-primary)">${t.code}</strong></td>
      <td>${t.discountPercent}% OFF</td>
      <td>Min Spend $${t.minSpend}</td>
      <td><span style="color:${t.active?"#10b981":"#ef4444"}; font-weight:700">${t.active?"ACTIVE":"INACTIVE"}</span></td>
    </tr>
  `).join("")}function U(){const e=document.getElementById("shopFeedbacksTable");if(!e)return;const o=r.getFeedbacks();if(o.length===0){e.innerHTML='<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-subtle)">No customer feedback or complaints logged yet.</td></tr>';return}e.innerHTML=o.map(t=>`
    <tr>
      <td><strong>${t.customerName}</strong><br/><span style="font-size:0.75rem; color:var(--text-subtle)">${t.email}</span></td>
      <td>${t.subject}</td>
      <td>${t.message}</td>
      <td><span style="font-weight:700; color:${t.status==="resolved"?"#10b981":"#f59e0b"}">${t.status.toUpperCase()}</span></td>
      <td>
        ${t.status==="open"?`<button class="btn-secondary btn-sm" onclick="window.resolveFb('${t.id}')">✓ Resolve</button>`:"✓ Done"}
      </td>
    </tr>
  `).join("")}window.resolveFb=function(e){r.resolveFeedback(e),window.Auth&&window.Auth.showToast&&window.Auth.showToast("Feedback marked as resolved.","success"),U()};function h(){const e=document.getElementById("stockAlerts");if(!e)return;const o=r.getProducts().filter(t=>t.stock<10);if(o.length===0){e.innerHTML='<div style="color:#10b981; font-weight:600">✓ All bakery items have healthy stock levels above 10 units.</div>';return}e.innerHTML=`
    <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); padding:1rem; border-radius:var(--radius-md)">
      <h4 style="color:#fca5a5; margin-bottom:0.5rem">⚠️ Low Stock Alerts (${o.length} items)</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem">
        ${o.map(t=>`
          <div style="display:flex; justify-content:space-between; font-size:0.85rem">
            <span><strong>${t.title}</strong> (${t.category})</span>
            <span style="color:#ef4444; font-weight:700">${t.stock} left</span>
          </div>
        `).join("")}
      </div>
    </div>
  `}window.selectPresetImage=function(e,o,t,a){const l=document.getElementById("prodImgUrl"),s=document.getElementById("prodTitle"),u=document.getElementById("prodCategory"),w=document.getElementById("prodPrice"),c=document.getElementById("imgPreview");l&&(l.value=e),s&&!s.value&&(s.value=o),u&&(u.value=t),w&&!w.value&&(w.value=a),c&&(c.src=e,c.style.display="block"),window.Auth&&window.Auth.showToast&&window.Auth.showToast(`Selected picture: ${e}`,"info")};
