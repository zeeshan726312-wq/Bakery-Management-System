// js/store.js - Central Data Store & Cloud Firestore Realtime Sync for LaylPur Bakery
import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

// Seed Products including local picture assets (Barfi.webp, Biscuits.avif, Gulab Jamun.webp)
const INITIAL_PRODUCTS = [
  {
    id: "prod-barfi",
    title: "Barfi",
    category: "Sweets",
    price: 8.00,
    stock: 25,
    image: "Barfi.webp",
    description: "Traditional LaylPur milk barfi made with pure desi ghee, silver leaf & ground pistachios.",
    rating: 5.0,
    discount: 0
  },
  {
    id: "prod-biscuits",
    title: "Biscuits",
    category: "Cookies",
    price: 6.00,
    stock: 40,
    image: "Biscuits.avif",
    description: "Crispy freshly baked almond & cardamom bakery tea biscuits.",
    rating: 4.9,
    discount: 5
  },
  {
    id: "prod-gulabjamun",
    title: "Gulab Jamun",
    category: "Sweets",
    price: 7.50,
    stock: 30,
    image: "Gulab Jamun.webp",
    description: "Soft, warm, syrup-soaked golden brown gulab jamun sweet delights.",
    rating: 5.0,
    discount: 0
  },
  {
    id: "prod-1",
    title: "Artisan Sourdough Loaf",
    category: "Breads",
    price: 6.50,
    stock: 25,
    image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
    description: "Traditional slow-fermented sourdough with a crispy golden crust and soft airy crumb.",
    rating: 4.9,
    discount: 0
  },
  {
    id: "prod-2",
    title: "Belgian Chocolate Cake",
    category: "Cakes",
    price: 28.00,
    stock: 12,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    description: "Rich 3-layer dark chocolate fudge cake with Belgian chocolate ganache.",
    rating: 5.0,
    discount: 10
  },
  {
    id: "prod-3",
    title: "French Butter Croissant",
    category: "Pastries",
    price: 3.80,
    stock: 40,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    description: "Flaky, buttery French style croissant baked fresh every morning.",
    rating: 4.8,
    discount: 0
  },
  {
    id: "prod-4",
    title: "Red Velvet Cupcake",
    category: "Cakes",
    price: 4.20,
    stock: 30,
    image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=600&q=80",
    description: "Moist red velvet cupcake topped with signature cream cheese frosting.",
    rating: 4.7,
    discount: 0
  },
  {
    id: "prod-5",
    title: "Choc Chip Cookie Box (6pcs)",
    category: "Cookies",
    price: 8.50,
    stock: 18,
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80",
    description: "Warm gooey cookies loaded with melted dark & milk chocolate chunks.",
    rating: 4.9,
    discount: 15
  },
  {
    id: "prod-6",
    title: "Caramel Macchiato Iced",
    category: "Beverages",
    price: 4.80,
    stock: 50,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    description: "Fresh espresso brewed over ice with vanilla syrup and salted caramel drizzle.",
    rating: 4.6,
    discount: 0
  }
];

// Initial Seed Orders
const INITIAL_ORDERS = [
  {
    id: "ORD-101",
    customerEmail: "customer@laylpurbakery.com",
    customerName: "Alice Baker",
    phone: "+1 555-0192",
    address: "742 Evergreen Terrace, LaylPur",
    items: [
      { id: "prod-barfi", title: "Barfi", price: 8.00, qty: 2, image: "Barfi.webp" },
      { id: "prod-gulabjamun", title: "Gulab Jamun", price: 7.50, qty: 1, image: "Gulab Jamun.webp" }
    ],
    subtotal: 23.50,
    discountAmount: 0,
    total: 23.50,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Paid",
    status: "delivered",
    createdAt: "2026-07-29T10:30:00.000Z"
  }
];

// Initial Discounts
const INITIAL_DISCOUNTS = [
  { id: "disc-1", code: "LAYLPUR10", discountPercent: 10, minSpend: 20, active: true },
  { id: "disc-2", code: "WELCOME20", discountPercent: 20, minSpend: 30, active: true }
];

// Initial Feedback
const INITIAL_FEEDBACKS = [
  {
    id: "fb-1",
    customerName: "Alice Baker",
    email: "customer@laylpurbakery.com",
    subject: "Loved the Barfi and Gulab Jamun!",
    message: "The Barfi and Gulab Jamun were super fresh and delicious!",
    date: "2026-07-29",
    status: "resolved"
  }
];

// Setup Realtime Cloud Sync via Cloud Firestore
let isCloudSynced = false;

async function syncDocToCloud(docName, data) {
  try {
    await setDoc(doc(db, "laylpur_store", docName), { data, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("Cloud Firestore Sync Warning:", err);
  }
}

// Subscribe to Realtime Cloud Updates from Firestore
function initRealtimeCloudSync() {
  const collections = ['products', 'orders', 'discounts', 'feedbacks'];
  
  collections.forEach(col => {
    onSnapshot(doc(db, "laylpur_store", col), (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data().data;
        if (cloudData && Array.isArray(cloudData)) {
          localStorage.setItem(`bakery_${col}`, JSON.stringify(cloudData));
          isCloudSynced = true;
          // Dispatch custom event to notify active views to refresh
          window.dispatchEvent(new CustomEvent('cloudStoreUpdated', { detail: { collection: col } }));
        }
      }
    }, (err) => {
      console.warn(`Firestore Realtime Listener [${col}] Warning:`, err);
    });
  });
}

// Initialize Cloud Listeners immediately
try {
  initRealtimeCloudSync();
} catch (e) {
  console.warn("Could not init Firestore Realtime listener:", e);
}

// Central Store Module
export const Store = {
  // PRODUCTS
  getProducts() {
    let products = [];
    const data = localStorage.getItem('bakery_products');
    if (!data) {
      localStorage.setItem('bakery_products', JSON.stringify(INITIAL_PRODUCTS));
      syncDocToCloud('products', INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    try {
      products = JSON.parse(data);
    } catch {
      products = INITIAL_PRODUCTS;
    }

    let updated = false;
    INITIAL_PRODUCTS.forEach(initP => {
      if (!products.some(p => p.id === initP.id || p.title.toLowerCase() === initP.title.toLowerCase())) {
        products.unshift(initP);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('bakery_products', JSON.stringify(products));
      syncDocToCloud('products', products);
    }

    return products;
  },

  saveProducts(products) {
    localStorage.setItem('bakery_products', JSON.stringify(products));
    syncDocToCloud('products', products);
  },

  addProduct(product) {
    const products = this.getProducts();
    const newProd = {
      id: "prod-" + Date.now(),
      title: product.title || "Untitled Bakery Product",
      category: product.category || "General",
      price: parseFloat(product.price) || 0,
      stock: parseInt(product.stock) || 0,
      image: product.image || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
      description: product.description || "Fresh baked item from LaylPur Bakery.",
      rating: 5.0,
      discount: parseInt(product.discount) || 0
    };
    products.unshift(newProd);
    this.saveProducts(products);
    return newProd;
  },

  updateProduct(id, updatedFields) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  },

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
  },

  // ORDERS
  getOrders() {
    const data = localStorage.getItem('bakery_orders');
    if (!data) {
      localStorage.setItem('bakery_orders', JSON.stringify(INITIAL_ORDERS));
      syncDocToCloud('orders', INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ORDERS;
    }
  },

  saveOrders(orders) {
    localStorage.setItem('bakery_orders', JSON.stringify(orders));
    syncDocToCloud('orders', orders);
  },

  addOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName,
      phone: orderData.phone || "+1 555-0000",
      address: orderData.address || "LaylPur Main City",
      items: orderData.items,
      subtotal: orderData.subtotal,
      discountAmount: orderData.discountAmount || 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod || "Cash on Delivery",
      paymentStatus: orderData.paymentMethod === "Credit Card" ? "Paid" : "Pending",
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const products = this.getProducts();
    orderData.items.forEach(item => {
      const prod = products.find(p => p.id === item.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.qty);
      }
    });
    this.saveProducts(products);

    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (newStatus === "delivered") {
        order.paymentStatus = "Paid";
      }
      this.saveOrders(orders);
      return order;
    }
    return null;
  },

  // DISCOUNTS
  getDiscounts() {
    const data = localStorage.getItem('bakery_discounts');
    if (!data) {
      localStorage.setItem('bakery_discounts', JSON.stringify(INITIAL_DISCOUNTS));
      syncDocToCloud('discounts', INITIAL_DISCOUNTS);
      return INITIAL_DISCOUNTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_DISCOUNTS;
    }
  },

  addDiscount(discount) {
    const discounts = this.getDiscounts();
    const newDisc = {
      id: "disc-" + Date.now(),
      code: discount.code.toUpperCase(),
      discountPercent: parseInt(discount.discountPercent),
      minSpend: parseFloat(discount.minSpend) || 0,
      active: true
    };
    discounts.unshift(newDisc);
    localStorage.setItem('bakery_discounts', JSON.stringify(discounts));
    syncDocToCloud('discounts', discounts);
    return newDisc;
  },

  // FEEDBACKS
  getFeedbacks() {
    const data = localStorage.getItem('bakery_feedbacks');
    if (!data) {
      localStorage.setItem('bakery_feedbacks', JSON.stringify(INITIAL_FEEDBACKS));
      syncDocToCloud('feedbacks', INITIAL_FEEDBACKS);
      return INITIAL_FEEDBACKS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_FEEDBACKS;
    }
  },

  addFeedback(fb) {
    const feedbacks = this.getFeedbacks();
    const newFb = {
      id: "fb-" + Date.now(),
      customerName: fb.customerName,
      email: fb.email,
      subject: fb.subject,
      message: fb.message,
      date: new Date().toISOString().split('T')[0],
      status: "open"
    };
    feedbacks.unshift(newFb);
    localStorage.setItem('bakery_feedbacks', JSON.stringify(feedbacks));
    syncDocToCloud('feedbacks', feedbacks);
    return newFb;
  },

  resolveFeedback(id) {
    const feedbacks = this.getFeedbacks();
    const fb = feedbacks.find(f => f.id === id);
    if (fb) {
      fb.status = "resolved";
      localStorage.setItem('bakery_feedbacks', JSON.stringify(feedbacks));
      syncDocToCloud('feedbacks', feedbacks);
    }
  },

  // SYSTEM RESET / SEED
  resetStore() {
    localStorage.setItem('bakery_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('bakery_orders', JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem('bakery_discounts', JSON.stringify(INITIAL_DISCOUNTS));
    localStorage.setItem('bakery_feedbacks', JSON.stringify(INITIAL_FEEDBACKS));

    syncDocToCloud('products', INITIAL_PRODUCTS);
    syncDocToCloud('orders', INITIAL_ORDERS);
    syncDocToCloud('discounts', INITIAL_DISCOUNTS);
    syncDocToCloud('feedbacks', INITIAL_FEEDBACKS);
  }
};

window.Store = Store;
