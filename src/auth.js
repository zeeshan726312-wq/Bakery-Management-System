// src/auth.js – Simple authentication module

const AUTH_KEY = 'bms_auth';

// Hardcoded credentials
const USERS = [
  { email: 'shop@gmail.com',     password: 'shop',     role: 'shopkeeper', name: 'Shopkeeper' },
  { email: 'coustmer@gmail.com', password: 'coustmer', role: 'customer',   name: 'Customer' },
];

/**
 * Attempt login. Returns user object on success, null on failure.
 */
export function login(email, password) {
  const user = USERS.find(u => u.email === email && u.password === password);
  if (user) {
    const session = { email: user.email, role: user.role, name: user.name, loggedInAt: new Date().toISOString() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  }
  return null;
}

/**
 * Log out the current user.
 */
export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

/**
 * Get the current session, or null if not logged in.
 */
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

/**
 * Check if a user is logged in.
 */
export function isLoggedIn() {
  return getSession() !== null;
}

/**
 * Get the current user's role ('shopkeeper' | 'customer' | null).
 */
export function getRole() {
  return getSession()?.role || null;
}
