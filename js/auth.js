// js/auth.js - Authentication & Storage Management System for Lyallpur Bakers
import { db } from './firebase-config.js';
import { doc, setDoc, onSnapshot } from "firebase/firestore";

// Default seed users
const DEFAULT_USERS = [
  {
    name: "System Admin",
    email: "admin@lyallpurbakers.com",
    password: "password123",
    role: "admin"
  },
  {
    name: "Master Baker",
    email: "shopkeeper@lyallpurbakers.com",
    password: "password123",
    role: "shopkeeper"
  },
  {
    name: "Alice Baker",
    email: "customer@lyallpurbakers.com",
    password: "password123",
    role: "customer"
  }
];

async function syncUsersToCloud(users) {
  try {
    await setDoc(doc(db, "lyallpur_store", "users"), { data: users, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("Cloud Users Sync Warning:", err);
  }
}

// Real-time Cloud Firestore User Listener
try {
  onSnapshot(doc(db, "lyallpur_store", "users"), (docSnap) => {
    if (docSnap.exists()) {
      const cloudUsers = docSnap.data().data;
      if (cloudUsers && Array.isArray(cloudUsers)) {
        localStorage.setItem('users', JSON.stringify(cloudUsers));
      }
    }
  }, (err) => {
    console.warn("Cloud Firestore User listener warning:", err);
  });
} catch (e) {
  console.warn("Could not init Firestore user listener:", e);
}

function initDefaultUsers() {
  let existing = [];
  try {
    const raw = localStorage.getItem('users');
    if (raw) existing = JSON.parse(raw);
  } catch (e) {
    existing = [];
  }

  let updated = false;

  // Migration for old user emails
  existing.forEach(u => {
    if (u.email && u.email.includes('laylpurbakery')) {
      u.email = u.email.replace(/laylpurbakery/g, 'lyallpurbakers');
      updated = true;
    }
  });

  DEFAULT_USERS.forEach(defUser => {
    if (!existing.some(u => u.email.toLowerCase() === defUser.email.toLowerCase())) {
      existing.push(defUser);
      updated = true;
    }
  });

  if (updated || !localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(existing));
    syncUsersToCloud(existing);
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
  syncUsersToCloud(users);
}

function setCurrentUser(user) {
  if (user && user.email && user.email.includes('laylpurbakery')) {
    user.email = user.email.replace(/laylpurbakery/g, 'lyallpurbakers');
  }
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
  const userJson = localStorage.getItem('currentUser');
  try {
    const user = userJson ? JSON.parse(userJson) : null;
    if (user && user.email && user.email.includes('laylpurbakery')) {
      user.email = user.email.replace(/laylpurbakery/g, 'lyallpurbakers');
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    return user;
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
  const roleAdminRadio = document.getElementById('roleAdmin');
  const roleShopRadio = document.getElementById('roleShopkeeper');
  const roleCustRadio = document.getElementById('roleCustomer');
  
  if (role === 'admin') {
    if (emailInput) emailInput.value = 'admin@lyallpurbakers.com';
    if (passInput) passInput.value = 'password123';
    if (roleAdminRadio) roleAdminRadio.checked = true;
  } else if (role === 'shopkeeper') {
    if (emailInput) emailInput.value = 'shopkeeper@lyallpurbakers.com';
    if (passInput) passInput.value = 'password123';
    if (roleShopRadio) roleShopRadio.checked = true;
  } else if (role === 'customer') {
    if (emailInput) emailInput.value = 'customer@lyallpurbakers.com';
    if (passInput) passInput.value = 'password123';
    if (roleCustRadio) roleCustRadio.checked = true;
  }

  showToast(`Selected ${role.toUpperCase()} role! Click "Sign In" button below.`, 'success');
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

    registerForm.addEventListener('submit', async (e) => {
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
      await syncUsersToCloud(users);

      showToast('Registration successful! Saved to Cloud. Redirecting...', 'success');
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
        showToast('Invalid email or password. Check spelling or register account.', 'error');
        return;
      }

      setCurrentUser(user);
      showToast(`Welcome to Lyallpur Bakers, ${user.name}! Redirecting...`, 'success');

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
