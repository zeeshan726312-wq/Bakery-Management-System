// src/pages/login.js – Sign-in page

import { login } from '../auth.js';

export function render() {
  return `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-brand">
          <div class="login-logo">🍞</div>
          <h1 class="login-title">Bakery Manager</h1>
          <p class="login-subtitle">Sign in to your account</p>
        </div>

        <form id="loginForm" class="login-form">
          <div class="form-group">
            <label for="loginEmail">Email Address</label>
            <div class="input-icon-wrapper">
              <span class="input-icon">📧</span>
              <input type="email" id="loginEmail" class="form-control login-input" placeholder="Enter your email" required autocomplete="email" />
            </div>
          </div>
          <div class="form-group">
            <label for="loginPassword">Password</label>
            <div class="input-icon-wrapper">
              <span class="input-icon">🔒</span>
              <input type="password" id="loginPassword" class="form-control login-input" placeholder="Enter your password" required autocomplete="current-password" />
            </div>
          </div>
          <div id="loginError" class="login-error" style="display:none;"></div>
          <button type="submit" class="btn btn-primary login-btn">Sign In</button>
        </form>

        <div class="login-footer">
          <div class="login-hint">
            <p class="hint-title">Demo Accounts</p>
            <div class="hint-cards">
              <button type="button" class="hint-card" data-email="shop@gmail.com" data-pass="shop">
                <span class="hint-icon">🏪</span>
                <span class="hint-role">Shopkeeper</span>
                <span class="hint-cred">shop@gmail.com</span>
              </button>
              <button type="button" class="hint-card" data-email="coustmer@gmail.com" data-pass="coustmer">
                <span class="hint-icon">👤</span>
                <span class="hint-role">Customer</span>
                <span class="hint-cred">coustmer@gmail.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function init() {
  // Form submit
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    const session = login(email, password);
    if (session) {
      // Trigger full app re-render
      window.location.hash = '#dashboard';
      window.location.reload();
    } else {
      errorEl.textContent = 'Invalid email or password. Please try again.';
      errorEl.style.display = 'block';
      // Shake animation
      const card = document.querySelector('.login-card');
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 500);
    }
  });

  // Quick-fill hint cards
  document.querySelectorAll('.hint-card').forEach(card => {
    card.addEventListener('click', () => {
      document.getElementById('loginEmail').value = card.dataset.email;
      document.getElementById('loginPassword').value = card.dataset.pass;
    });
  });
}
