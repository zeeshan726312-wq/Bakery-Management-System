// src/js/auth.js
// Authentication logic using localStorage.
// Functions are attached to the window object for easy access from HTML pages.

function getUsers() {
  const usersJson = localStorage.getItem('users');
  return usersJson ? JSON.parse(usersJson) : [];
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}
function getCurrentUser() {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}
function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}
function logout() {
  clearCurrentUser();
  window.location.href = '/src/pages/login.html';
}

// Registration handler
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const role = document.getElementById('role').value;

      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(email)) {
        alert('Invalid email address.');
        return;
      }
      const users = getUsers();
      if (users.some(u => u.email === email)) {
        alert('User with this email already exists.');
        return;
      }
      const newUser = { name, email, password, role };
      users.push(newUser);
      saveUsers(users);
      alert('Registration successful! You can now log in.');
      window.location.href = '/src/pages/login.html';
    });
  }

  // Login handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert('Invalid credentials.');
        return;
      }
      setCurrentUser(user);
      // Navigate based on role
      switch (user.role) {
        case 'admin':
          window.location.href = '/src/pages/admin.html';
          break;
        case 'shopkeeper':
          window.location.href = '/src/pages/shopkeeper.html';
          break;
        case 'customer':
          window.location.href = '/src/pages/customer.html';
          break;
        default:
          alert('Unknown role.');
      }
    });
  }
});

// Expose useful helpers globally
window.getCurrentUser = getCurrentUser;
window.logout = logout;
