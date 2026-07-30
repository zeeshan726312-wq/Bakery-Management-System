import"./auth-DGG0_UAO.js";import{S as p}from"./store-DbBK5EXH.js";let l=[],y=0,h="All";document.addEventListener("DOMContentLoaded",()=>{let t=window.getCurrentUser?window.getCurrentUser():JSON.parse(localStorage.getItem("currentUser"));(!t||t.role!=="customer")&&(t={name:"Alice Baker",email:"customer@laylpurbakery.com",role:"customer"},window.Auth&&window.Auth.setCurrentUser?window.Auth.setCurrentUser(t):localStorage.setItem("currentUser",JSON.stringify(t)));const n=document.getElementById("userName"),e=document.getElementById("userNameHeader");n&&(n.textContent=t.name),e&&(e.textContent=t.name),document.getElementById("profName")&&(document.getElementById("profName").value=t.name),document.getElementById("profEmail")&&(document.getElementById("profEmail").value=t.email),g(),I(),L(),f(),M()});function M(){document.querySelectorAll(".tab-btn").forEach(c=>{c.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(u=>u.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(u=>u.style.display="none"),c.classList.add("active");const d=c.getAttribute("data-target");document.getElementById(d)&&(document.getElementById(d).style.display="block")})}),document.querySelectorAll(".cat-pill").forEach(c=>{c.addEventListener("click",()=>{document.querySelectorAll(".cat-pill").forEach(d=>d.classList.remove("active")),c.classList.add("active"),h=c.getAttribute("data-cat"),g()})});const t=document.getElementById("searchProducts");t&&t.addEventListener("input",()=>{g()});const n=document.getElementById("openCartBtn"),e=document.getElementById("closeCartBtn"),s=document.getElementById("cartBackdrop"),r=document.getElementById("cartDrawer"),o=c=>{c?(s&&s.classList.add("active"),r&&r.classList.add("active"),b()):(s&&s.classList.remove("active"),r&&r.classList.remove("active"))};n&&n.addEventListener("click",()=>o(!0)),e&&e.addEventListener("click",()=>o(!1)),s&&s.addEventListener("click",()=>o(!1));const i=document.getElementById("openCheckoutBtn"),a=document.getElementById("checkoutModal"),$=document.getElementById("closeCheckoutBtn");i&&i.addEventListener("click",()=>{if(l.length===0){window.Auth&&window.Auth.showToast&&window.Auth.showToast("Your cart is empty!","error");return}o(!1),a&&a.classList.add("active"),P()}),$&&a&&$.addEventListener("click",()=>a.classList.remove("active"));const E=document.getElementById("checkoutForm");E&&E.addEventListener("submit",c=>{c.preventDefault();const d=(window.getCurrentUser?window.getCurrentUser():null)||{email:"customer@laylpurbakery.com",name:"Alice Baker"},u=document.getElementById("checkoutAddress").value.trim(),m=document.getElementById("checkoutPhone").value.trim(),T=document.querySelector('input[name="paymentMethod"]:checked').value,w=l.reduce((F,C)=>F+C.price*C.qty,0),x=w*y/100,S=w-x,q=p.addOrder({customerEmail:d.email,customerName:d.name,address:u,phone:m,items:l,subtotal:w,discountAmount:x,total:S,paymentMethod:T});window.Auth&&window.Auth.showToast&&window.Auth.showToast(`Order #${q.id} placed successfully!`,"success"),l=[],y=0,f(),a&&a.classList.remove("active");const A=document.querySelector('[data-target="trackerTab"]');A&&A.click(),I(),L(),g()});const B=document.getElementById("applyCouponBtn");B&&B.addEventListener("click",()=>{const c=document.getElementById("couponCode").value.trim().toUpperCase(),u=p.getDiscounts().find(m=>m.code===c&&m.active);u?(y=u.discountPercent,window.Auth&&window.Auth.showToast&&window.Auth.showToast(`Coupon applied! ${u.discountPercent}% OFF`,"success"),b()):window.Auth&&window.Auth.showToast&&window.Auth.showToast("Invalid or expired coupon code.","error")});const k=document.getElementById("profileForm");k&&k.addEventListener("submit",c=>{c.preventDefault();const d=(window.getCurrentUser?window.getCurrentUser():null)||{email:"customer@laylpurbakery.com",name:"Alice Baker",role:"customer"};d.name=document.getElementById("profName").value,d.phone=document.getElementById("profPhone").value,d.address=document.getElementById("profAddress").value,window.Auth&&window.Auth.setCurrentUser&&window.Auth.setCurrentUser(d);const u=document.getElementById("userName"),m=document.getElementById("userNameHeader");u&&(u.textContent=d.name),m&&(m.textContent=d.name),window.Auth&&window.Auth.showToast&&window.Auth.showToast("Profile updated successfully!","success")});const v=document.getElementById("feedbackForm");v&&v.addEventListener("submit",c=>{c.preventDefault();const d=(window.getCurrentUser?window.getCurrentUser():null)||{email:"customer@laylpurbakery.com",name:"Alice Baker"},u=document.getElementById("fbSubject").value.trim(),m=document.getElementById("fbMessage").value.trim();p.addFeedback({customerName:d.name,email:d.email,subject:u,message:m}),window.Auth&&window.Auth.showToast&&window.Auth.showToast("Thank you! Your feedback has been sent to Admin.","success"),v.reset()})}function g(){var r;const t=document.getElementById("productsGrid");if(!t)return;const n=p.getProducts(),e=(((r=document.getElementById("searchProducts"))==null?void 0:r.value)||"").toLowerCase(),s=n.filter(o=>{const i=h==="All"||o.category===h,a=o.title.toLowerCase().includes(e)||o.description.toLowerCase().includes(e);return i&&a});if(s.length===0){t.innerHTML='<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-subtle)">No bakery items found matching your criteria.</div>';return}t.innerHTML=s.map(o=>{const i=o.discount>0?(o.price*(1-o.discount/100)).toFixed(2):o.price.toFixed(2);return`
      <div class="product-card">
        <div class="product-img-wrapper">
          <img src="${o.image}" alt="${o.title}" class="product-img" onerror="this.src='https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'" />
          <span class="product-tag">${o.category}</span>
          ${o.discount>0?`<span class="discount-badge">-${o.discount}%</span>`:""}
        </div>
        <div class="product-body">
          <div style="display:flex; justify-content:space-between; align-items:center">
            <h3 class="product-title">${o.title}</h3>
            <span style="font-size:0.8rem; color:var(--warm-gold); font-weight:700">★ ${o.rating}</span>
          </div>
          <p class="product-desc">${o.description}</p>
          <div style="font-size:0.75rem; margin-bottom:0.75rem; color:${o.stock>5?"#10b981":"#ef4444"}; font-weight:700">
            ${o.stock>0?`In Stock (${o.stock} available)`:"Out of Stock"}
          </div>
          <div class="product-footer">
            <div>
              <span class="product-price">$${i}</span>
              ${o.discount>0?`<span class="old-price">$${o.price.toFixed(2)}</span>`:""}
            </div>
            <button onclick="window.addToCart('${o.id}')" ${o.stock<=0?'disabled style="opacity:0.5; cursor:not-allowed"':""} class="btn-primary" style="padding:0.4rem 0.9rem; font-size:0.85rem">
              + Add to Cart
            </button>
          </div>
        </div>
      </div>
    `}).join("")}window.addToCart=function(t){const e=p.getProducts().find(r=>r.id===t);if(!e)return;const s=l.find(r=>r.id===t);if(s){if(s.qty>=e.stock){window.Auth&&window.Auth.showToast&&window.Auth.showToast(`Sorry, only ${e.stock} in stock!`,"error");return}s.qty+=1}else{const r=e.discount>0?e.price*(1-e.discount/100):e.price;l.push({id:e.id,title:e.title,price:r,image:e.image,qty:1})}f(),window.Auth&&window.Auth.showToast&&window.Auth.showToast(`Added ${e.title} to cart!`,"success")};function f(){const t=l.reduce((e,s)=>e+s.qty,0),n=document.getElementById("cartBadge");n&&(n.textContent=t)}function b(){const t=document.getElementById("cartItemsList"),n=document.getElementById("cartSubtotal"),e=document.getElementById("cartTotal");if(!t)return;if(l.length===0){t.innerHTML='<div style="text-align:center; padding:2rem; color:var(--text-subtle)">Your cart is empty. Add fresh items from the menu!</div>',n&&(n.textContent="$0.00"),e&&(e.textContent="$0.00");return}const s=l.reduce((i,a)=>i+a.price*a.qty,0),r=s*y/100,o=s-r;t.innerHTML=l.map(i=>`
    <div class="cart-item">
      <img src="${i.image}" alt="${i.title}" class="cart-item-img" />
      <div class="cart-item-details">
        <h4 style="font-size:0.9rem; font-weight:700">${i.title}</h4>
        <div style="font-size:0.85rem; color:var(--amber-primary); font-weight:700">$${i.price.toFixed(2)} each</div>
      </div>
      <div style="display:flex; align-items:center; gap:0.4rem">
        <button class="qty-btn" onclick="window.changeCartQty('${i.id}', -1)">-</button>
        <span style="font-weight:700; font-size:0.9rem">${i.qty}</span>
        <button class="qty-btn" onclick="window.changeCartQty('${i.id}', 1)">+</button>
      </div>
    </div>
  `).join(""),n&&(n.textContent=`$${s.toFixed(2)}`),e&&(e.textContent=`$${o.toFixed(2)}`)}window.changeCartQty=function(t,n){const e=l.find(s=>s.id===t);e&&(e.qty+=n,e.qty<=0&&(l=l.filter(s=>s.id!==t)),f(),b())};function P(){const t=document.getElementById("checkoutSummary");if(!t)return;const n=l.reduce((r,o)=>r+o.price*o.qty,0),e=n*y/100,s=n-e;t.innerHTML=`
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem">
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem">
        <span>Items (${l.reduce((r,o)=>r+o.qty,0)}):</span>
        <span>$${n.toFixed(2)}</span>
      </div>
      ${y>0?`
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:#10b981">
          <span>Discount (${y}%):</span>
          <span>-$${e.toFixed(2)}</span>
        </div>
      `:""}
      <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.1rem; color:var(--amber-primary); border-top:1px solid rgba(255,255,255,0.1); padding-top:0.5rem">
        <span>Total Payable:</span>
        <span>$${s.toFixed(2)}</span>
      </div>
    </div>
  `}function I(){const t=document.getElementById("trackerContent");if(!t)return;const n=(window.getCurrentUser?window.getCurrentUser():null)||{email:"customer@laylpurbakery.com"},e=p.getOrders().filter(a=>a.customerEmail===n.email);if(e.length===0){t.innerHTML='<div style="text-align:center; padding:3rem; color:var(--text-subtle)">No active orders. Place your first order from the Bakery Menu!</div>';return}const r=e.filter(a=>a.status!=="delivered"&&a.status!=="cancelled")[0]||e[0],i=["pending","baking","ready","delivered"].indexOf(r.status);t.innerHTML=`
    <div style="background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); border-radius:var(--radius-md); padding:1.5rem; margin-bottom:1.5rem">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
        <div>
          <h3 style="font-size:1.2rem; font-weight:700">Order ${r.id}</h3>
          <span style="font-size:0.8rem; color:var(--text-subtle)">Placed on ${new Date(r.createdAt).toLocaleDateString()}</span>
        </div>
        <span class="badge-status status-${r.status}">${r.status}</span>
      </div>

      <div class="status-stepper">
        <div class="step-node ${i>=0?i>0?"completed":"active":""}">
          <div class="step-circle">1</div>
          <span class="step-label">Pending</span>
        </div>
        <div class="step-node ${i>=1?i>1?"completed":"active":""}">
          <div class="step-circle">2</div>
          <span class="step-label">Baking</span>
        </div>
        <div class="step-node ${i>=2?i>2?"completed":"active":""}">
          <div class="step-circle">3</div>
          <span class="step-label">Ready</span>
        </div>
        <div class="step-node ${i>=3?"completed active":""}">
          <div class="step-circle">4</div>
          <span class="step-label">Delivered</span>
        </div>
      </div>

      <div style="margin-top:1.5rem; border-top:1px solid rgba(255,255,255,0.08); padding-top:1rem">
        <h4 style="font-size:0.9rem; font-weight:700; margin-bottom:0.5rem">Items in Order:</h4>
        ${r.items.map(a=>`
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.25rem">
            <span>${a.qty}x ${a.title}</span>
            <span>$${(a.price*a.qty).toFixed(2)}</span>
          </div>
        `).join("")}
        <div style="display:flex; justify-content:space-between; font-weight:700; color:var(--amber-primary); margin-top:0.5rem; font-size:0.95rem">
          <span>Total:</span>
          <span>$${r.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `}function L(){const t=document.getElementById("orderHistoryTable");if(!t)return;const n=(window.getCurrentUser?window.getCurrentUser():null)||{email:"customer@laylpurbakery.com"},e=p.getOrders().filter(s=>s.customerEmail===n.email);if(e.length===0){t.innerHTML='<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-subtle)">No past orders found.</td></tr>';return}t.innerHTML=e.map(s=>`
    <tr>
      <td><strong>${s.id}</strong></td>
      <td>${new Date(s.createdAt).toLocaleDateString()}</td>
      <td>$${s.total.toFixed(2)}</td>
      <td><span class="badge-status status-${s.status}">${s.status}</span></td>
      <td>
        <button class="btn-secondary btn-sm" onclick="window.viewReceipt('${s.id}')">🧾 View Receipt</button>
      </td>
    </tr>
  `).join("")}window.viewReceipt=function(t){const n=p.getOrders().find(r=>r.id===t);if(!n)return;const e=document.getElementById("receiptModal"),s=document.getElementById("receiptModalBody");!e||!s||(s.innerHTML=`
    <div style="text-align:center; margin-bottom:1.5rem; border-bottom:1px dashed var(--glass-border); padding-bottom:1rem">
      <div style="font-size:2rem">🥐</div>
      <h2 class="font-serif-title" style="font-size:1.4rem">LaylPur Bakery</h2>
      <p style="font-size:0.8rem; color:var(--text-subtle)">Official Purchase Invoice</p>
      <div style="font-size:0.85rem; margin-top:0.5rem"><strong>Order ID:</strong> ${n.id} | <strong>Date:</strong> ${new Date(n.createdAt).toLocaleString()}</div>
    </div>

    <div style="margin-bottom:1rem; font-size:0.85rem; color:var(--text-muted)">
      <div><strong>Customer:</strong> ${n.customerName}</div>
      <div><strong>Delivery Address:</strong> ${n.address}</div>
      <div><strong>Payment Method:</strong> ${n.paymentMethod} (${n.paymentStatus})</div>
    </div>

    <table class="custom-table" style="margin-bottom:1rem">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${n.items.map(r=>`
          <tr>
            <td>${r.title}</td>
            <td>${r.qty}</td>
            <td>$${(r.price*r.qty).toFixed(2)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div style="border-top:1px dashed var(--glass-border); padding-top:0.75rem; font-size:0.9rem">
      <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem">
        <span>Subtotal:</span>
        <span>$${n.subtotal.toFixed(2)}</span>
      </div>
      ${n.discountAmount>0?`
        <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem; color:#10b981">
          <span>Discount:</span>
          <span>-$${n.discountAmount.toFixed(2)}</span>
        </div>
      `:""}
      <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.1rem; color:var(--amber-primary); margin-top:0.5rem">
        <span>Total Paid:</span>
        <span>$${n.total.toFixed(2)}</span>
      </div>
    </div>
  `,e.classList.add("active"))};document.getElementById("closeReceiptBtn")&&document.getElementById("closeReceiptBtn").addEventListener("click",()=>{const t=document.getElementById("receiptModal");t&&t.classList.remove("active")});
