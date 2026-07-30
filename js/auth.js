// js/auth.js - Authentication & Storage Management System for LaylPur Bakery

// Comprehensive default seed users
const DEFAULT_USERS = [
  {
    name: "System Admin",
    email: "admin@laylpurbakery.com",
    password: "password123",
    role: "admin"
  },
  {
    name: "System Admin",
    email: "admin@bakery.com",
    password: "password123",
    role: "admin"
  },
  {
    name: "Master Baker",
    email: "shopkeeper@laylpurbakery.com",
    password: "password123",
    role: "shopkeeper"
  },
  {
    name: "Master Baker",
    email: "shopkeeper@bakery.com",
    password: "password123",
    role: "shopkeeper"
  },
  {
    name: "Alice Baker",
    email: "customer@laylpurbakery.com",
    password: "password123",
    role: "customer"
  },
  {
    name: "Alice Baker",
    email: "customer@bakery.com",
    password: "password123",
    role: "customer"
  }
];

function initDefaultUsers() {
  let existing = [];
  try {
    const raw = localStorage.getItem('users');
    if (raw) existing = JSON.parse(raw);
  } catch (e) {
    existing = [];
  }

  let updated = false;
  DEFAULT_USERS.forEach(defUser => {
    if (!existing.some(u => u.email.toLowerCase() === defUser.email.toLowerCase())) {
      existing.push(defUser);
      updated = true;
    }
  });

  if (updated || !localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(existing));
  }
}

function getUsers() {
  initDefaultUsers();
  const usersJson = localStorage.getItem('users');
  try {
    return usersJson ? JSON.parse(usersJson) : DEFAULT_USERS;
  } catch (e) {
    return DEFAULT_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
  const userJson = localStorage.getItem('currentUser');
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
}

function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

function logout() {
  clearCurrentUser();
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `
    <span><strong>${icon}</strong> ${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#fff;cursor:pointer;font-size:1.1rem">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Quick Demo Login helper
function quickFillLogin(role) {
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  
  if (role === 'admin') {
    if (emailInput) emailInput.value = 'admin@laylpurbakery.com';
    if (passInput) passInput.value = 'password123';
  } else if (role === 'shopkeeper') {
    if (emailInput) emailInput.value = 'shopkeeper@laylpurbakery.com';
    if (passInput) passInput.value = 'password123';
  } else if (role === 'customer') {
    if (emailInput) emailInput.value = 'customer@laylpurbakery.com';
    if (passInput) passInput.value = 'password123';
  }

  showToast(`Auto-filled ${role.toUpperCase()} credentials! Click "Sign In" button below.`, 'success');
}

// DOM Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initDefaultUsers();

  // Handle password toggle buttons
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        const isPass = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPass ? 'text' : 'password');
        btn.textContent = isPass ? '🙈' : '👁️';
      }
    });
  });

  // Handle registration form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const passwordInput = document.getElementById('password');
    const strengthBar = document.getElementById('strengthBar');

    if (passwordInput && strengthBar) {
      passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        let score = 0;
        if (val.length >= 6) score += 33;
        if (val.length >= 10) score += 33;
        if (/[A-Z]/.test(val) || /[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score += 34;
        
        strengthBar.style.width = score + '%';
        if (score <= 33) strengthBar.style.backgroundColor = '#ef4444';
        else if (score <= 66) strengthBar.style.backgroundColor = '#f59e0b';
        else strengthBar.style.backgroundColor = '#10b981';
      });
    }

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      const roleElement = document.querySelector('input[name="role"]:checked') || document.getElementById('role');
      const role = roleElement ? roleElement.value : 'customer';

      if (!name) {
        showToast('Please enter your full name.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }

      const users = getUsers();
      if (users.some(u => u.email.toLowerCase() === email)) {
        showToast('An account with this email already exists.', 'error');
        return;
      }

      const newUser = { name, email, password, role };
      users.push(newUser);
      saveUsers(users);

      showToast('Registration successful! Redirecting to Sign In...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    });
  }

  // Handle login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');

      if (!emailInput || !passwordInput) return;

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      if (!email || !password) {
        showToast('Please enter both email address and password.', 'error');
        return;
      }

      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

      if (!user) {
        showToast('Invalid email or password. Use password123 or click Quick Demo Login below.', 'error');
        return;
      }

      setCurrentUser(user);
      showToast(`Welcome to LaylPur Bakery, ${user.name}! Redirecting...`, 'success');

      setTimeout(() => {
        switch (user.role) {
          case 'admin':
            window.location.href = 'admin.html';
            break;
          case 'shopkeeper':
            window.location.href = 'shopkeeper.html';
            break;
          case 'customer':
            window.location.href = 'customer.html';
            break;
          default:
            window.location.href = 'customer.html';
        }
      }, 800);
    });
  }
});

// Make functions globally available
window.Auth = {
  getUsers,
  saveUsers,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  logout,
  showToast,
  quickFillLogin
};

window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.quickFillLogin = quickFillLogin;
