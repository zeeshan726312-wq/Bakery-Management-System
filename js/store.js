// js/store.js - Central Data Store & Cloud Firestore Realtime Sync for Lyallpur Bakers
import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

// Seed Products including local picture assets (Barfi.webp, Biscuits.avif, Gulab Jamun.webp)
const INITIAL_PRODUCTS = [
  {
    id: "prod-barfi",
    title: "Lyallpur Royal Barfi",
    category: "Sweets",
    price: 8.00,
    stock: 35,
    image: "Barfi.webp",
    description: "Traditional Lyallpur Bakers milk barfi made with pure desi ghee, silver foil leaf & ground pistachios.",
    rating: 5.0,
    discount: 0,
    ribbon: "Chef's Special 🍯"
  },
  {
    id: "prod-biscuits",
    title: "Artisan Tea Biscuits",
    category: "Cookies",
    price: 6.00,
    stock: 50,
    image: "Biscuits.avif",
    description: "Crispy freshly baked almond & cardamom bakery tea biscuits handcrafted daily.",
    rating: 4.9,
    discount: 5,
    ribbon: "Bestseller ⭐"
  },
  {
    id: "prod-gulabjamun",
    title: "Golden Gulab Jamun",
    category: "Sweets",
    price: 7.50,
    stock: 40,
    image: "Gulab Jamun.webp",
    description: "Soft, warm, cardamom syrup-soaked golden brown sweet delights from Lyallpur Bakers.",
    rating: 5.0,
    discount: 0,
    ribbon: "Oven Hot ♨️"
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
    discount: 0,
    ribbon: "Organic Wheat 🌾"
  },
  {
    id: "prod-2",
    title: "Belgian Chocolate Cake",
    category: "Cakes",
    price: 28.00,
    stock: 15,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    description: "Rich 3-layer dark chocolate fudge cake with Belgian chocolate ganache.",
    rating: 5.0,
    discount: 10,
    ribbon: "Premium Cake 🍰"
  },
  {
    id: "prod-3",
    title: "French Butter Croissant",
    category: "Pastries",
    price: 3.80,
    stock: 40,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    description: "Flaky, buttery French style croissant baked fresh in our oven every morning.",
    rating: 4.8,
    discount: 0,
    ribbon: "Baked Fresh 🥐"
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
    discount: 0,
    ribbon: "Sweet Treat 🧁"
  },
  {
    id: "prod-5",
    title: "Choc Chip Cookie Box (6pcs)",
    category: "Cookies",
    price: 8.50,
    stock: 20,
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80",
    description: "Warm gooey cookies loaded with melted dark & milk chocolate chunks.",
    rating: 4.9,
    discount: 15,
    ribbon: "Choc Fudge 🍪"
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
    discount: 0,
    ribbon: "Cold Brew ☕"
  }
];

// Initial Seed Orders
const INITIAL_ORDERS = [
  {
    id: "ORD-101",
    customerEmail: "customer@lyallpurbakers.com",
    customerName: "Alice Baker",
    phone: "+1 555-0192",
    address: "742 Evergreen Terrace, Lyallpur",
    items: [
      { id: "prod-barfi", title: "Lyallpur Royal Barfi", price: 8.00, qty: 2, image: "Barfi.webp" },
      { id: "prod-gulabjamun", title: "Golden Gulab Jamun", price: 7.50, qty: 1, image: "Gulab Jamun.webp" }
    ],
    subtotal: 23.50,
    discountAmount: 0,
    total: 23.50,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Paid",
    status: "delivered",
    createdAt: new Date().toISOString()
  }
];

// Initial Discounts
const INITIAL_DISCOUNTS = [
  { id: "disc-1", code: "LYALLPUR10", discountPercent: 10, minSpend: 20, active: true },
  { id: "disc-2", code: "WELCOME20", discountPercent: 20, minSpend: 30, active: true }
];

// Initial Feedback
const INITIAL_FEEDBACKS = [
  {
    id: "fb-1",
    customerName: "Alice Baker",
    email: "customer@lyallpurbakers.com",
    subject: "Loved the Royal Barfi and Gulab Jamun!",
    message: "The Barfi and Gulab Jamun were super fresh and delicious! Thank you Lyallpur Bakers!",
    date: new Date().toISOString().split('T')[0],
    status: "resolved"
  }
];

// Initial Seed Shop Branches
const INITIAL_SHOPS = [
  { id: "shop-1", name: "Lyallpur Bakers Main Branch", location: "Clock Tower Plaza, Lyallpur", manager: "Master Baker", phone: "+1 (555) 019-9283", status: "Active", createdAt: "2026-01-10" },
  { id: "shop-2", name: "Lyallpur Bakers Mall Road", location: "Mall Road Sector 4, Lyallpur", manager: "Hamza Baker", phone: "+1 (555) 029-4821", status: "Active", createdAt: "2026-03-15" }
];

// Initial Seed Delivery Riders
const INITIAL_RIDERS = [
  { id: "rider-1", name: "Tariq Mahmood", phone: "+1 555-0188", status: "Available", totalDeliveries: 42, vehicle: "Motorbike" },
  { id: "rider-2", name: "Bilal Ahmad", phone: "+1 555-0199", status: "Out for Delivery", totalDeliveries: 28, vehicle: "Scooter" }
];

// Initial Shopkeeper Store Info & Contact
const DEFAULT_SHOP_INFO = {
  shopkeeperName: "Master Baker",
  shopName: "Lyallpur Bakers Main Branch",
  phone: "+1 (555) 019-9283",
  address: "Clock Tower Plaza, Main Bazaar, Lyallpur",
  email: "shopkeeper@lyallpurbakers.com",
  hours: "8:00 AM - 10:00 PM Daily"
};

// Setup Realtime Cloud Sync via Cloud Firestore
let isCloudSynced = false;

async function syncDocToCloud(docName, data) {
  try {
    await setDoc(doc(db, "lyallpur_store", docName), { data, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("Cloud Firestore Sync Warning:", err);
  }
}

// Subscribe to Realtime Cloud Updates from Firestore
function initRealtimeCloudSync() {
  const collections = ['products', 'orders', 'discounts', 'feedbacks', 'shops', 'riders', 'shop_info'];
  
  collections.forEach(col => {
    onSnapshot(doc(db, "lyallpur_store", col), (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data().data;
        if (cloudData) {
          localStorage.setItem(`bakery_${col}`, JSON.stringify(cloudData));
          isCloudSynced = true;
          window.dispatchEvent(new CustomEvent('cloudStoreUpdated', { detail: { collection: col } }));
        }
      }
    }, (err) => {
      console.warn(`Firestore Realtime Listener [${col}] Warning:`, err);
    });
  });
}

try {
  initRealtimeCloudSync();
} catch (e) {
  console.warn("Could not init Firestore Realtime listener:", e);
}

// Central Store Module
export const Store = {
  // SHOP INFO & CONTACT
  getShopInfo() {
    const data = localStorage.getItem('bakery_shop_info');
    if (!data) {
      localStorage.setItem('bakery_shop_info', JSON.stringify(DEFAULT_SHOP_INFO));
      syncDocToCloud('shop_info', DEFAULT_SHOP_INFO);
      return DEFAULT_SHOP_INFO;
    }
    try {
      const parsed = JSON.parse(data);
      // Migrate old names if present
      if (parsed.shopName && parsed.shopName.includes('LaylPur')) {
        parsed.shopName = parsed.shopName.replace(/LaylPur/g, 'Lyallpur');
        parsed.address = parsed.address.replace(/LaylPur/g, 'Lyallpur');
        localStorage.setItem('bakery_shop_info', JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_SHOP_INFO;
    }
  },

  saveShopInfo(info) {
    const updated = { ...this.getShopInfo(), ...info };
    localStorage.setItem('bakery_shop_info', JSON.stringify(updated));
    syncDocToCloud('shop_info', updated);
    return updated;
  },

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
    // Migrate old product names
    products.forEach(p => {
      if (p.description && p.description.includes('LaylPur')) {
        p.description = p.description.replace(/LaylPur/g, 'Lyallpur');
        updated = true;
      }
      if (p.title && p.title.includes('LaylPur')) {
        p.title = p.title.replace(/LaylPur/g, 'Lyallpur');
        updated = true;
      }
    });

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
      title: product.title || "Untitled Bakery Item",
      category: product.category || "General",
      price: parseFloat(product.price) || 0,
      stock: parseInt(product.stock) || 0,
      image: product.image || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
      description: product.description || "Fresh baked delight from Lyallpur Bakers.",
      rating: 5.0,
      discount: parseInt(product.discount) || 0,
      ribbon: product.ribbon || "Oven Fresh ♨️"
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
      const orders = JSON.parse(data);
      orders.forEach(o => {
        if (o.customerEmail && o.customerEmail.includes('laylpurbakery')) {
          o.customerEmail = o.customerEmail.replace(/laylpurbakery/g, 'lyallpurbakers');
        }
        if (o.address && o.address.includes('LaylPur')) {
          o.address = o.address.replace(/LaylPur/g, 'Lyallpur');
        }
      });
      return orders;
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
      address: orderData.address || "Lyallpur Main City",
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

  // SHOPS
  getShops() {
    const data = localStorage.getItem('bakery_shops');
    if (!data) {
      localStorage.setItem('bakery_shops', JSON.stringify(INITIAL_SHOPS));
      syncDocToCloud('shops', INITIAL_SHOPS);
      return INITIAL_SHOPS;
    }
    try {
      const shops = JSON.parse(data);
      shops.forEach(s => {
        if (s.name && s.name.includes('LaylPur')) {
          s.name = s.name.replace(/LaylPur/g, 'Lyallpur');
          s.location = s.location.replace(/LaylPur/g, 'Lyallpur');
        }
      });
      return shops;
    } catch {
      return INITIAL_SHOPS;
    }
  },

  addShop(shop) {
    const shops = this.getShops();
    const newShop = {
      id: "shop-" + Date.now(),
      name: shop.name || "Lyallpur Bakers New Branch",
      location: shop.location || "Lyallpur City",
      manager: shop.manager || "Branch Manager",
      phone: shop.phone || "+1 555-0000",
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0]
    };
    shops.unshift(newShop);
    localStorage.setItem('bakery_shops', JSON.stringify(shops));
    syncDocToCloud('shops', shops);
    return newShop;
  },

  deleteShop(id) {
    const shops = this.getShops().filter(s => s.id !== id);
    localStorage.setItem('bakery_shops', JSON.stringify(shops));
    syncDocToCloud('shops', shops);
  },

  // RIDERS
  getRiders() {
    const data = localStorage.getItem('bakery_riders');
    if (!data) {
      localStorage.setItem('bakery_riders', JSON.stringify(INITIAL_RIDERS));
      syncDocToCloud('riders', INITIAL_RIDERS);
      return INITIAL_RIDERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_RIDERS;
    }
  },

  addRider(rider) {
    const riders = this.getRiders();
    const newRider = {
      id: "rider-" + Date.now(),
      name: rider.name || "Delivery Rider",
      phone: rider.phone || "+1 555-0000",
      vehicle: rider.vehicle || "Motorbike",
      status: "Available",
      totalDeliveries: 0
    };
    riders.unshift(newRider);
    localStorage.setItem('bakery_riders', JSON.stringify(riders));
    syncDocToCloud('riders', riders);
    return newRider;
  },

  deleteRider(id) {
    const riders = this.getRiders().filter(r => r.id !== id);
    localStorage.setItem('bakery_riders', JSON.stringify(riders));
    syncDocToCloud('riders', riders);
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
    localStorage.setItem('bakery_shops', JSON.stringify(INITIAL_SHOPS));
    localStorage.setItem('bakery_riders', JSON.stringify(INITIAL_RIDERS));
    localStorage.setItem('bakery_shop_info', JSON.stringify(DEFAULT_SHOP_INFO));

    syncDocToCloud('products', INITIAL_PRODUCTS);
    syncDocToCloud('orders', INITIAL_ORDERS);
    syncDocToCloud('discounts', INITIAL_DISCOUNTS);
    syncDocToCloud('feedbacks', INITIAL_FEEDBACKS);
    syncDocToCloud('shops', INITIAL_SHOPS);
    syncDocToCloud('riders', INITIAL_RIDERS);
    syncDocToCloud('shop_info', DEFAULT_SHOP_INFO);
  }
};

window.Store = Store;
