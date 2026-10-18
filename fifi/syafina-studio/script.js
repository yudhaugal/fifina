/* ============================================
   SYAFINA STUDIO — Main JavaScript
   Fashion Wanita Elegant & Modern
   ============================================ */

'use strict';

/* ===== CONFIGURATION ===== */
const CONFIG = {
  API_BASE: 'http://localhost:3000/api',
  CURRENCY_OPTIONS: { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 },
  SHIPPING_COSTS: { regular: 15000, express: 25000 },
  FALLBACK_IMAGE: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'%3E%3Crect fill='%23F4F1F2' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%239B8A92' font-size='14' font-family='Inter,sans-serif'%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E"
};

const CATEGORIES = [
  { id: 'tops', name: 'Tops', icon: 'fa-shirt' },
  { id: 'blouse', name: 'Blouse', icon: 'fa-vest-patches' },
  { id: 'dresses', name: 'Dresses', icon: 'fa-person-dress' },
  { id: 'outerwear', name: 'Outerwear', icon: 'fa-mitten' },
  { id: 'skirts', name: 'Skirts', icon: 'fa-fan' },
  { id: 'pants', name: 'Pants', icon: 'fa-socks' },
  { id: 'hijab', name: 'Hijab', icon: 'fa-hat-cowboy' },
  { id: 'accessories', name: 'Accessories', icon: 'fa-gem' }
];

/* ===== STATE MANAGEMENT ===== */
const State = {
  products: [],
  cart: [],
  wishlist: [],
  user: null,
  currentSection: 'home',
  filters: { search: '', category: '', sizes: [], colors: [], priceMin: null, priceMax: null, sort: 'default' },
  selectedProduct: null,
  isBackendAvailable: false
};

/* ===== UTILITY FUNCTIONS ===== */
function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', CONFIG.CURRENCY_OPTIONS).format(price);
}

function sanitize(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function showToast(message, type = 'info') {
  const container = $('#toastContainer');
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${sanitize(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setLoading(btn, loading) {
  if (!btn) return;
  const text = btn.querySelector('.btn__text');
  const loader = btn.querySelector('.btn__loading');
  if (text) text.style.display = loading ? 'none' : '';
  if (loader) loader.style.display = loading ? 'inline-flex' : 'none';
  btn.disabled = loading;
}

function handleImageError(img) {
  img.onerror = null;
  img.src = CONFIG.FALLBACK_IMAGE;
}

/* ===== API CLIENT ===== */
const API = {
  async request(endpoint, options = {}) {
    try {
      const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      const data = await res.json();
      if (!res.ok) throw { status: res.status, message: data.message || 'Terjadi kesalahan', data };
      return data;
    } catch (err) {
      if (err.status) throw err;
      throw { status: 0, message: 'Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.' };
    }
  },

  // Products
  getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products${query ? '?' + query : ''}`);
  },
  getProduct(id) { return this.request(`/products/${id}`); },
  getCategories() { return this.request('/categories'); },

  // Auth
  register(data) { return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); },
  login(data) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }); },
  logout() { return this.request('/auth/logout', { method: 'POST' }); },
  getMe() { return this.request('/auth/me'); },

  // Wishlist
  getWishlist() { return this.request('/wishlist'); },
  addWishlist(productId) { return this.request('/wishlist', { method: 'POST', body: JSON.stringify({ product_id: productId }) }); },
  removeWishlist(productId) { return this.request(`/wishlist/${productId}`, { method: 'DELETE' }); },

  // Orders
  createOrder(data) { return this.request('/orders', { method: 'POST', body: JSON.stringify(data) }); },
  getOrders() { return this.request('/orders'); },
  getOrder(id) { return this.request(`/orders/${id}`); }
};

/* ===== DEMO PRODUCT DATA ===== */
const DEMO_PRODUCTS = [
  { id: 1, name: 'Essential Basic Top', slug: 'essential-basic-top', category: 'tops', description: 'Top kasual yang nyaman untuk aktivitas sehari-hari. Bahan lembut dan breathable, cocok dipadukan dengan berbagai bawahan.', price: 189000, discount_price: null, image: 'images/product-01.jpg', images: ['images/product-01.jpg'], sizes: ['S','M','L','XL'], colors: ['Putih','Hitam','Abu-abu'], stock: 25, label: 'New Arrival', created_at: '2026-10-15' },
  { id: 2, name: 'Rosé Casual Blouse', slug: 'rose-casual-blouse', category: 'blouse', description: 'Blouse kasual dengan sentuhan feminin. Desain elegan dengan detail halus yang membuatmu tampil menawan di setiap kesempatan.', price: 259000, discount_price: 219000, image: 'images/product-02.jpg', images: ['images/product-02.jpg'], sizes: ['S','M','L'], colors: ['Pink','Putih','Krem'], stock: 18, label: 'Sale', created_at: '2026-10-14' },
  { id: 3, name: 'Champagne Satin Blouse', slug: 'champagne-satin-blouse', category: 'blouse', description: 'Blouse satin mewah dengan kilau champagne yang anggun. Sempurna untuk acara semi-formal atau tampilan premium sehari-hari.', price: 329000, discount_price: null, image: 'images/product-03.jpg', images: ['images/product-03.jpg'], sizes: ['S','M','L','XL'], colors: ['Gold','Silver','Champagne'], stock: 12, label: '', created_at: '2026-10-13' },
  { id: 4, name: 'Dusty Rose Midi Dress', slug: 'dusty-rose-midi-dress', category: 'dresses', description: 'Dress midi dengan siluet A-line yang anggun. Warna dusty rose yang lembut memberikan kesan feminin dan elegan.', price: 389000, discount_price: 349000, image: 'images/product-04.jpg', images: ['images/product-04.jpg'], sizes: ['S','M','L'], colors: ['Dusty Rose','Mauve','Blush'], stock: 8, label: 'Sale', created_at: '2026-10-12' },
  { id: 5, name: 'Garden Floral Midi Dress', slug: 'garden-floral-midi-dress', category: 'dresses', description: 'Dress midi bermotif floral dengan detail tier di bagian bawah. Cocok untuk acara outdoor maupun hangout kasual.', price: 359000, discount_price: null, image: 'images/product-05.jpg', images: ['images/product-05.jpg'], sizes: ['S','M','L','XL'], colors: ['Cream Floral','Pink Floral'], stock: 15, label: 'New Arrival', created_at: '2026-10-16' },
  { id: 6, name: 'Cozy Knit Cardigan', slug: 'cozy-knit-cardigan', category: 'outerwear', description: 'Cardigan rajut yang nyaman dan hangat. Desain open-front klasik yang mudah dipadupadankan dengan outfit apapun.', price: 279000, discount_price: null, image: 'images/product-06.jpg', images: ['images/product-06.jpg'], sizes: ['M','L','XL'], colors: ['Krem','Abu-abu','Cokelat'], stock: 20, label: '', created_at: '2026-10-11' },
  { id: 7, name: 'Mauve Tailored Blazer', slug: 'mauve-tailored-blazer', category: 'outerwear', description: 'Blazer tailored dengan warna mauve yang elegan. Potongan profesional yang memberikan kesan polished dan modern.', price: 429000, discount_price: 379000, image: 'images/product-07.jpg', images: ['images/product-07.jpg'], sizes: ['S','M','L'], colors: ['Mauve','Hitam','Navy'], stock: 10, label: 'Sale', created_at: '2026-10-10' },
  { id: 8, name: 'Sage Pleated Skirt', slug: 'sage-pleated-skirt', category: 'skirts', description: 'Rok pleated midi dengan warna sage yang tenang. Jatuhnya anggun dan nyaman digunakan seharian.', price: 249000, discount_price: null, image: 'images/product-08.jpg', images: ['images/product-08.jpg'], sizes: ['S','M','L','XL'], colors: ['Sage','Krem','Hitam'], stock: 22, label: '', created_at: '2026-10-09' },
  { id: 9, name: 'Classic Wide Leg Pants', slug: 'classic-wide-leg-pants', category: 'pants', description: 'Celana wide leg dengan potongan klasik yang membuat kaki terlihat lebih jenjang. Nyaman untuk berbagai aktivitas.', price: 289000, discount_price: null, image: 'images/product-09.jpg', images: ['images/product-09.jpg'], sizes: ['S','M','L','XL'], colors: ['Hitam','Krem','Abu-abu'], stock: 17, label: 'New Arrival', created_at: '2026-10-17' },
  { id: 10, name: 'Linen Casual Trousers', slug: 'linen-casual-trousers', category: 'pants', description: 'Celana casual dari bahan linen yang breathable. Sempurna untuk tampilan santai namun tetap stylish.', price: 269000, discount_price: 239000, image: 'images/product-10.jpg', images: ['images/product-10.jpg'], sizes: ['S','M','L'], colors: ['Krem','Olive','Putih'], stock: 14, label: 'Sale', created_at: '2026-10-08' },
  { id: 11, name: 'Premium Voal Hijab', slug: 'premium-voal-hijab', category: 'hijab', description: 'Hijab voal premium dengan finishing laser cut. Bahan lembut, tidak mudah kusut, dan mudah dibentuk.', price: 129000, discount_price: null, image: 'images/product-11.jpg', images: ['images/product-11.jpg'], sizes: ['All Size'], colors: ['Dusty Pink','Mocca','Navy','Hitam','Putih'], stock: 50, label: '', created_at: '2026-10-07' },
  { id: 12, name: 'Pashmina Satin Silk', slug: 'pashmina-satin-silk', category: 'hijab', description: 'Pashmina satin silk dengan kilau halus yang elegan. Ukuran besar sehingga mudah di-styling sesuai selera.', price: 159000, discount_price: 139000, image: 'images/product-12.jpg', images: ['images/product-12.jpg'], sizes: ['All Size'], colors: ['Blush','Champagne','Grey','Hitam'], stock: 35, label: 'Sale', created_at: '2026-10-06' },
  { id: 13, name: 'Pearl Necklace Set', slug: 'pearl-necklace-set', category: 'accessories', description: 'Set kalung mutiara minimalis yang menambah kesan elegan pada outfit apapun. Cocok untuk tampilan kasual hingga formal.', price: 179000, discount_price: null, image: 'images/product-13.jpg', images: ['images/product-13.jpg'], sizes: ['All Size'], colors: ['Gold','Silver'], stock: 30, label: 'New Arrival', created_at: '2026-10-18' },
  { id: 14, name: 'Elegant Wrap Dress', slug: 'elegant-wrap-dress', category: 'dresses', description: 'Wrap dress elegan yang membentuk siluet tubuh dengan cantik. Desain timeless yang cocok untuk berbagai acara.', price: 399000, discount_price: 359000, image: 'images/product-14.jpg', images: ['images/product-14.jpg'], sizes: ['S','M','L'], colors: ['Burgundy','Hitam','Navy'], stock: 6, label: 'Sale', created_at: '2026-10-05' },
  { id: 15, name: 'Soft Ruffle Top', slug: 'soft-ruffle-top', category: 'tops', description: 'Top dengan detail ruffle yang manis dan feminin. Bahan ringan dan adem, nyaman untuk cuaca tropis.', price: 209000, discount_price: null, image: 'images/product-15.jpg', images: ['images/product-15.jpg'], sizes: ['S','M','L','XL'], colors: ['Putih','Pink','Lilac'], stock: 19, label: '', created_at: '2026-10-04' },
  { id: 16, name: 'Mini Tote Bag', slug: 'mini-tote-bag', category: 'accessories', description: 'Tote bag mini yang compact namun cukup untuk menyimpan essentials. Desain minimalis yang versatile.', price: 219000, discount_price: null, image: 'images/product-16.jpg', images: ['images/product-16.jpg'], sizes: ['All Size'], colors: ['Krem','Hitam','Cokelat'], stock: 28, label: 'New Arrival', created_at: '2026-10-03' }
];

/* ===== INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initSearchBar();
  initMobileMenu();
  initPromoBanner();
  initFAQ();
  initPasswordToggles();
  initFilters();
  loadCartFromStorage();
  loadWishlistFromStorage();
  setFooterYear();

  // Try backend, fallback to demo data
  await loadProducts();
  await checkAuthStatus();

  renderCategories();
  renderHomeProducts();
  renderShopProducts();
  updateCartBadge();
  updateWishlistBadge();

  // Setup auth forms
  initAuthForms();
  initCheckout();
  initProductDetail();
});

/* ===== NAVIGATION ===== */
function initNavigation() {
  // All nav links
  document.addEventListener('click', (e) => {
    const navLink = e.target.closest('[data-nav]');
    if (!navLink) return;
    e.preventDefault();
    const section = navLink.dataset.nav;
    navigateTo(section);
    closeMobileMenu();
    closeAllDrawers();
  });
}

function navigateTo(section) {
  // Handle special sections
  if (section === 'categories') {
    navigateTo('home');
    setTimeout(() => {
      const el = $('#categoriesSection');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return;
  }

  if (section === 'new-arrivals') {
    navigateTo('home');
    setTimeout(() => {
      const el = $('#newArrivalsSection');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return;
  }

  if (section === 'about') {
    navigateTo('home');
    setTimeout(() => {
      const el = $('#aboutSection');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return;
  }

  if (section === 'contact') {
    navigateTo('home');
    setTimeout(() => {
      const el = $('#contactSection');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return;
  }

  // Switch page sections
  const pages = { home: 'sectionHome', shop: 'sectionShop' };
  const targetId = pages[section] || pages.home;

  $$('.page-section').forEach(p => p.classList.remove('active'));
  const target = $(`#${targetId}`);
  if (target) target.classList.add('active');

  // Update nav active state
  $$('.header__nav-link').forEach(l => l.classList.remove('active'));
  const activeLink = $(`.header__nav-link[data-nav="${section}"]`);
  if (activeLink) activeLink.classList.add('active');

  State.currentSection = section;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (section === 'shop') renderShopProducts();
}

/* ===== SEARCH BAR ===== */
function initSearchBar() {
  const toggle = $('#searchToggle');
  const bar = $('#searchBar');
  const input = $('#searchInput');
  const closeBtn = $('#searchClose');
  const searchBtn = $('#searchBtn');

  toggle.addEventListener('click', () => {
    bar.classList.toggle('active');
    if (bar.classList.contains('active')) {
      setTimeout(() => input.focus(), 300);
    }
  });

  closeBtn.addEventListener('click', () => {
    bar.classList.remove('active');
    input.value = '';
  });

  searchBtn.addEventListener('click', () => performSearch(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch(input.value);
  });
}

function performSearch(query) {
  State.filters.search = query.trim();
  navigateTo('shop');
  $('#filterSearch').value = query.trim();
  renderShopProducts();
  $('#searchBar').classList.remove('active');
}

/* ===== MOBILE MENU ===== */
function initMobileMenu() {
  const hamburger = $('#hamburgerBtn');
  const menu = $('#mobileMenu');
  const closeBtn = $('#mobileMenuClose');
  const overlay = $('#mobileMenuOverlay');

  hamburger.addEventListener('click', () => {
    menu.classList.add('active');
    hamburger.classList.add('active');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  });

  [closeBtn, overlay].forEach(el => {
    el.addEventListener('click', closeMobileMenu);
  });

  // Accordion
  $$('.mobile-menu__accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const list = btn.nextElementSibling;
      list.classList.toggle('active');
    });
  });
}

function closeMobileMenu() {
  const menu = $('#mobileMenu');
  const hamburger = $('#hamburgerBtn');
  menu.classList.remove('active');
  hamburger.classList.remove('active');
  menu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

/* ===== PROMO BANNER ===== */
function initPromoBanner() {
  const banner = $('#promoBanner');
  const closeBtn = $('#promoBannerClose');
  closeBtn.addEventListener('click', () => banner.classList.add('hidden'));
}

/* ===== HEADER SCROLL ===== */
window.addEventListener('scroll', () => {
  const header = $('#mainHeader');
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* ===== FAQ ===== */
function initFAQ() {
  $$('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      const answer = btn.nextElementSibling;
      if (!expanded) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = '0';
      }
    });
  });
}

/* ===== PASSWORD TOGGLES ===== */
function initPasswordToggles() {
  $$('.form-toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });
}

/* ===== FOOTER YEAR ===== */
function setFooterYear() {
  const el = $('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ===== LOAD PRODUCTS ===== */
async function loadProducts() {
  try {
    const data = await API.getProducts();
    State.products = data.products || data;
    State.isBackendAvailable = true;
  } catch (err) {
    State.products = DEMO_PRODUCTS;
    State.isBackendAvailable = false;
  }
}

/* ===== CHECK AUTH ===== */
async function checkAuthStatus() {
  if (!State.isBackendAvailable) return;
  try {
    const data = await API.getMe();
    State.user = data.user || data;
    updateAuthUI();
    await syncWishlist();
  } catch {
    State.user = null;
    updateAuthUI();
  }
}

function updateAuthUI() {
  const accountToggle = $('#accountToggle');
  if (State.user) {
    accountToggle.innerHTML = '<i class="fas fa-user-check"></i>';
  } else {
    accountToggle.innerHTML = '<i class="fas fa-user"></i>';
  }
}

/* ===== RENDER CATEGORIES ===== */
function renderCategories() {
  const grid = $('#categoriesGrid');
  const dropdown = $('#categoryDropdown');
  const mobileList = $('#mobileCategoryList');
  const footerCats = $('#footerCategories');
  const filterCats = $('#filterCategory');

  grid.innerHTML = '';
  dropdown.innerHTML = '';
  mobileList.innerHTML = '';
  footerCats.innerHTML = '';
  filterCats.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const count = State.products.filter(p => p.category === cat.id).length;

    // Grid card
    const card = document.createElement('div');
    card.className = 'category-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Kategori ${cat.name}`);
    card.innerHTML = `
      <div class="category-card__icon"><i class="fas ${cat.icon}"></i></div>
      <p class="category-card__name">${sanitize(cat.name)}</p>
      <p class="category-card__count">${count} produk</p>
    `;
    card.addEventListener('click', () => filterByCategory(cat.id));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') filterByCategory(cat.id); });
    grid.appendChild(card);

    // Dropdown
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" data-category="${cat.id}">${sanitize(cat.name)}</a>`;
    li.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); filterByCategory(cat.id); });
    dropdown.appendChild(li);

    // Mobile menu
    const mli = document.createElement('li');
    mli.innerHTML = `<a href="#" data-category="${cat.id}">${sanitize(cat.name)}</a>`;
    mli.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); filterByCategory(cat.id); closeMobileMenu(); });
    mobileList.appendChild(mli);

    // Footer
    const fli = document.createElement('li');
    fli.innerHTML = `<a href="#" data-category="${cat.id}">${sanitize(cat.name)}</a>`;
    fli.querySelector('a').addEventListener('click', (e) => { e.preventDefault(); filterByCategory(cat.id); });
    footerCats.appendChild(fli);

    // Filter sidebar
    const label = document.createElement('label');
    label.className = 'filter-option';
    label.innerHTML = `<input type="checkbox" value="${cat.id}" data-filter="category"> ${sanitize(cat.name)} (${count})`;
    filterCats.appendChild(label);
  });

  // Render size filter
  renderSizeFilter();
  renderColorFilter();
}

function renderSizeFilter() {
  const container = $('#filterSize');
  container.innerHTML = '';
  const sizes = ['S', 'M', 'L', 'XL', 'All Size'];
  sizes.forEach(size => {
    const btn = document.createElement('button');
    btn.className = 'filter-option--size';
    btn.textContent = size;
    btn.dataset.size = size;
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      updateFilters();
    });
    container.appendChild(btn);
  });
}

function renderColorFilter() {
  const container = $('#filterColor');
  container.innerHTML = '';
  const colorsSet = new Set();
  State.products.forEach(p => (p.colors || []).forEach(c => colorsSet.add(c)));
  Array.from(colorsSet).sort().forEach(color => {
    const label = document.createElement('label');
    label.className = 'filter-option';
    label.innerHTML = `<input type="checkbox" value="${sanitize(color)}" data-filter="color"> ${sanitize(color)}`;
    container.appendChild(label);
  });
}

function filterByCategory(catId) {
  navigateTo('shop');
  // Clear all category checkboxes first
  $$('#filterCategory input').forEach(cb => cb.checked = false);
  // Check the matching one
  const cb = $(`#filterCategory input[value="${catId}"]`);
  if (cb) cb.checked = true;
  updateFilters();
  renderShopProducts();
}

/* ===== RENDER HOME PRODUCTS ===== */
function renderHomeProducts() {
  // New Arrivals
  const newArrivals = [...State.products]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);
  renderProductGrid($('#newArrivalsGrid'), newArrivals);

  // Featured (has discount or high price)
  const featured = State.products
    .filter(p => p.discount_price || p.label === 'Sale')
    .slice(0, 4);
  renderProductGrid($('#featuredGrid'), featured.length > 0 ? featured : State.products.slice(0, 4));
}

/* ===== RENDER SHOP PRODUCTS ===== */
function renderShopProducts() {
  let filtered = [...State.products];

  // Search
  if (State.filters.search) {
    const q = State.filters.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  }

  // Category
  const selectedCats = Array.from($$('#filterCategory input:checked')).map(cb => cb.value);
  if (selectedCats.length > 0) {
    filtered = filtered.filter(p => selectedCats.includes(p.category));
  }

  // Sizes
  const selectedSizes = Array.from($$('#filterSize .filter-option--size.active')).map(b => b.dataset.size);
  if (selectedSizes.length > 0) {
    filtered = filtered.filter(p => (p.sizes || []).some(s => selectedSizes.includes(s)));
  }

  // Colors
  const selectedColors = Array.from($$('#filterColor input:checked')).map(cb => cb.value);
  if (selectedColors.length > 0) {
    filtered = filtered.filter(p => (p.colors || []).some(c => selectedColors.includes(c)));
  }

  // Price range
  const minPrice = parseFloat($('#filterPriceMin').value);
  const maxPrice = parseFloat($('#filterPriceMax').value);
  if (!isNaN(minPrice) && minPrice > 0) {
    filtered = filtered.filter(p => (p.discount_price || p.price) >= minPrice);
  }
  if (!isNaN(maxPrice) && maxPrice > 0) {
    if (!isNaN(minPrice) && maxPrice < minPrice) {
      // Don't filter if max < min
    } else {
      filtered = filtered.filter(p => (p.discount_price || p.price) <= maxPrice);
    }
  }

  // Sort
  const sort = $('#filterSort').value;
  switch (sort) {
    case 'price-asc':
      filtered.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
      break;
    case 'price-desc':
      filtered.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
      break;
    case 'newest':
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
  }

  // Render
  const shopGrid = $('#shopGrid');
  const shopEmpty = $('#shopEmpty');
  const countEl = $('#shopCount');

  countEl.textContent = `Menampilkan ${filtered.length} produk`;

  if (filtered.length === 0) {
    shopGrid.style.display = 'none';
    shopEmpty.style.display = 'block';
  } else {
    shopGrid.style.display = '';
    shopEmpty.style.display = 'none';
    renderProductGrid(shopGrid, filtered);
  }
}

/* ===== RENDER PRODUCT GRID ===== */
function renderProductGrid(container, products) {
  container.innerHTML = '';
  products.forEach(product => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('role', 'article');

  const displayPrice = product.discount_price || product.price;
  const isWishlisted = State.wishlist.includes(product.id);

  let labelsHtml = '';
  if (product.label) {
    const labelClass = product.label.toLowerCase().includes('sale') ? 'sale' : 'new';
    labelsHtml = `<div class="product-card__labels"><span class="product-card__label product-card__label--${labelClass}">${sanitize(product.label)}</span></div>`;
  }

  let priceHtml = `<span class="product-card__price-current">${formatPrice(displayPrice)}</span>`;
  if (product.discount_price && product.discount_price < product.price) {
    priceHtml += `<span class="product-card__price-original">${formatPrice(product.price)}</span>`;
  }

  card.innerHTML = `
    <div class="product-card__image-wrapper">
      <img src="${sanitize(product.image)}" alt="${sanitize(product.name)}" class="product-card__image" loading="lazy" onerror="handleImageError(this)">
      ${labelsHtml}
      <div class="product-card__actions-overlay">
        <button class="product-card__action-btn ${isWishlisted ? 'wishlisted' : ''}" data-wishlist="${product.id}" aria-label="Tambah ke wishlist">
          <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <button class="product-card__action-btn" data-quick-view="${product.id}" aria-label="Lihat detail">
          <i class="fas fa-eye"></i>
        </button>
        <button class="product-card__action-btn" data-quick-cart="${product.id}" aria-label="Tambah ke keranjang">
          <i class="fas fa-shopping-bag"></i>
        </button>
      </div>
    </div>
    <div class="product-card__info">
      <p class="product-card__category">${sanitize(CATEGORIES.find(c => c.id === product.category)?.name || product.category)}</p>
      <h3 class="product-card__name">${sanitize(product.name)}</h3>
      <div class="product-card__price">${priceHtml}</div>
    </div>
  `;

  // Click events
  card.querySelector('[data-quick-view]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openProductDetail(product.id);
  });

  card.querySelector('[data-wishlist]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  });

  card.querySelector('[data-quick-cart]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    quickAddToCart(product.id);
  });

  card.addEventListener('click', () => openProductDetail(product.id));

  return card;
}

/* ===== PRODUCT DETAIL ===== */
function initProductDetail() {
  const modal = $('#productModal');
  const closeBtn = $('#productModalClose');
  const overlay = $('#productModalOverlay');

  [closeBtn, overlay].forEach(el => {
    el.addEventListener('click', () => closeModal(modal));
  });

  // Quantity controls
  $('#qtyMinus').addEventListener('click', () => {
    const input = $('#qtyInput');
    const val = parseInt(input.value) || 1;
    if (val > 1) input.value = val - 1;
  });

  $('#qtyPlus').addEventListener('click', () => {
    const input = $('#qtyInput');
    const val = parseInt(input.value) || 1;
    const max = State.selectedProduct?.stock || 99;
    if (val < max) input.value = val + 1;
  });

  // Add to cart
  $('#addToCartBtn').addEventListener('click', () => addToCartFromDetail());
  $('#buyNowBtn').addEventListener('click', () => buyNow());
  $('#addToWishlistBtn').addEventListener('click', () => {
    if (State.selectedProduct) toggleWishlist(State.selectedProduct.id);
  });
}

function openProductDetail(productId) {
  const product = State.products.find(p => p.id === productId);
  if (!product) return;

  State.selectedProduct = product;
  const modal = $('#productModal');

  // Populate
  $('#productMainImage').src = product.image;
  $('#productMainImage').alt = product.name;
  $('#productMainImage').onerror = function() { handleImageError(this); };
  $('#productCategory').textContent = CATEGORIES.find(c => c.id === product.category)?.name || product.category;
  $('#productName').textContent = product.name;

  const displayPrice = product.discount_price || product.price;
  $('#productPrice').textContent = formatPrice(displayPrice);

  if (product.discount_price && product.discount_price < product.price) {
    $('#productOriginalPrice').textContent = formatPrice(product.price);
    const discount = Math.round((1 - product.discount_price / product.price) * 100);
    $('#productDiscountBadge').textContent = `-${discount}%`;
  } else {
    $('#productOriginalPrice').textContent = '';
    $('#productDiscountBadge').textContent = '';
  }

  $('#productDesc').textContent = product.description;
  $('#productLabel').textContent = product.label || '';

  // Stock
  const stockEl = $('#productStock');
  if (product.stock > 10) {
    stockEl.textContent = `Stok tersedia: ${product.stock}`;
    stockEl.className = 'product-detail__stock in-stock';
  } else if (product.stock > 0) {
    stockEl.textContent = `Sisa ${product.stock} item`;
    stockEl.className = 'product-detail__stock low-stock';
  } else {
    stockEl.textContent = 'Stok habis';
    stockEl.className = 'product-detail__stock out-of-stock';
  }

  // Thumbnails
  const thumbs = $('#productThumbnails');
  thumbs.innerHTML = '';
  (product.images || [product.image]).forEach((img, i) => {
    const thumb = document.createElement('div');
    thumb.className = `product-detail__thumbnail ${i === 0 ? 'active' : ''}`;
    thumb.innerHTML = `<img src="${sanitize(img)}" alt="${sanitize(product.name)} ${i + 1}" onerror="handleImageError(this)">`;
    thumb.addEventListener('click', () => {
      $('#productMainImage').src = img;
      $$('.product-detail__thumbnail').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
    thumbs.appendChild(thumb);
  });

  // Sizes
  const sizesContainer = $('#productSizes');
  sizesContainer.innerHTML = '';
  (product.sizes || []).forEach(size => {
    const btn = document.createElement('button');
    btn.className = 'size-option';
    btn.textContent = size;
    btn.addEventListener('click', () => {
      $$('.size-option').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      $('#sizeError').textContent = '';
    });
    sizesContainer.appendChild(btn);
  });

  // Show/hide size option
  $('#productSizeOption').style.display = (product.sizes && product.sizes.length > 0) ? '' : 'none';

  // Colors
  const colorsContainer = $('#productColors');
  colorsContainer.innerHTML = '';
  (product.colors || []).forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'color-option';
    btn.textContent = color;
    btn.addEventListener('click', () => {
      $$('.color-option').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      $('#colorError').textContent = '';
    });
    colorsContainer.appendChild(btn);
  });

  // Show/hide color option
  $('#productColorOption').style.display = (product.colors && product.colors.length > 0) ? '' : 'none';

  // Reset
  $('#qtyInput').value = 1;
  $('#qtyInput').max = product.stock;
  $('#sizeError').textContent = '';
  $('#colorError').textContent = '';

  // Wishlist icon
  updateWishlistButton();

  // Disable buttons if out of stock
  const outOfStock = product.stock <= 0;
  $('#addToCartBtn').disabled = outOfStock;
  $('#buyNowBtn').disabled = outOfStock;

  openModal(modal);
}

function updateWishlistButton() {
  if (!State.selectedProduct) return;
  const btn = $('#addToWishlistBtn');
  const isWishlisted = State.wishlist.includes(State.selectedProduct.id);
  btn.innerHTML = `<i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>`;
}

function validateProductSelection() {
  const product = State.selectedProduct;
  if (!product) return false;

  let valid = true;

  // Check size
  if (product.sizes && product.sizes.length > 0 && !product.sizes.includes('All Size')) {
    const selectedSize = $('.size-option.active');
    if (!selectedSize) {
      $('#sizeError').textContent = 'Pilih ukuran terlebih dahulu';
      valid = false;
    }
  }

  // Check color
  if (product.colors && product.colors.length > 0) {
    const selectedColor = $('.color-option.active');
    if (!selectedColor) {
      $('#colorError').textContent = 'Pilih warna terlebih dahulu';
      valid = false;
    }
  }

  return valid;
}

function getSelectedOptions() {
  const size = $('.size-option.active')?.textContent || 'All Size';
  const color = $('.color-option.active')?.textContent || '';
  const qty = parseInt($('#qtyInput').value) || 1;
  return { size, color, qty };
}

function addToCartFromDetail() {
  if (!State.selectedProduct) return;
  if (!validateProductSelection()) return;

  const { size, color, qty } = getSelectedOptions();
  addToCart(State.selectedProduct, size, color, qty);
  closeModal($('#productModal'));
}

function buyNow() {
  if (!State.selectedProduct) return;
  if (!validateProductSelection()) return;

  const { size, color, qty } = getSelectedOptions();
  addToCart(State.selectedProduct, size, color, qty);
  closeModal($('#productModal'));
  openCheckout();
}

function quickAddToCart(productId) {
  const product = State.products.find(p => p.id === productId);
  if (!product || product.stock <= 0) {
    showToast('Stok produk habis', 'warning');
    return;
  }
  const size = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'All Size';
  const color = (product.colors && product.colors.length > 0) ? product.colors[0] : '';
  addToCart(product, size, color, 1);
}

/* ===== CART ===== */
function addToCart(product, size, color, qty) {
  if (product.stock <= 0) {
    showToast('Stok produk habis', 'warning');
    return;
  }

  const existingIndex = State.cart.findIndex(item =>
    item.product_id === product.id && item.size === size && item.color === color
  );

  if (existingIndex > -1) {
    const newQty = State.cart[existingIndex].quantity + qty;
    if (newQty > product.stock) {
      showToast(`Stok tersedia hanya ${product.stock} item`, 'warning');
      return;
    }
    State.cart[existingIndex].quantity = newQty;
  } else {
    if (qty > product.stock) {
      showToast(`Stok tersedia hanya ${product.stock} item`, 'warning');
      return;
    }
    State.cart.push({
      product_id: product.id,
      name: product.name,
      image: product.image,
      price: product.discount_price || product.price,
      original_price: product.price,
      size,
      color,
      quantity: qty,
      stock: product.stock
    });
  }

  saveCartToStorage();
  updateCartBadge();
  renderCart();
  showToast(`${product.name} ditambahkan ke keranjang`, 'success');
}

function removeFromCart(index) {
  State.cart.splice(index, 1);
  saveCartToStorage();
  updateCartBadge();
  renderCart();
}

function updateCartQuantity(index, delta) {
  const item = State.cart[index];
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty < 1) {
    removeFromCart(index);
    return;
  }
  if (newQty > item.stock) {
    showToast(`Stok tersedia hanya ${item.stock} item`, 'warning');
    return;
  }
  State.cart[index].quantity = newQty;
  saveCartToStorage();
  renderCart();
  updateCartBadge();
}

function renderCart() {
  const container = $('#cartItems');
  const empty = $('#cartEmpty');
  const footer = $('#cartDrawerFooter');

  container.innerHTML = '';

  if (State.cart.length === 0) {
    empty.style.display = 'block';
    footer.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  footer.style.display = 'block';

  State.cart.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item__image"><img src="${sanitize(item.image)}" alt="${sanitize(item.name)}" onerror="handleImageError(this)"></div>
      <div class="cart-item__details">
        <p class="cart-item__name">${sanitize(item.name)}</p>
        <p class="cart-item__variant">${sanitize(item.size)}${item.color ? ' · ' + sanitize(item.color) : ''}</p>
        <p class="cart-item__price">${formatPrice(item.price)}</p>
        <div class="cart-item__controls">
          <button class="cart-item__qty-btn" data-cart-minus="${index}" aria-label="Kurangi">−</button>
          <span class="cart-item__qty">${item.quantity}</span>
          <button class="cart-item__qty-btn" data-cart-plus="${index}" aria-label="Tambah">+</button>
        </div>
      </div>
      <button class="cart-item__remove" data-cart-remove="${index}" aria-label="Hapus item">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;

    el.querySelector('[data-cart-minus]').addEventListener('click', () => updateCartQuantity(index, -1));
    el.querySelector('[data-cart-plus]').addEventListener('click', () => updateCartQuantity(index, 1));
    el.querySelector('[data-cart-remove]').addEventListener('click', () => removeFromCart(index));
    container.appendChild(el);
  });

  // Calculate totals
  const subtotal = State.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  $('#cartSubtotal').textContent = formatPrice(subtotal);
  $('#cartTotal').textContent = formatPrice(subtotal);
}

function updateCartBadge() {
  const totalItems = State.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = $('#cartBadge');
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

function saveCartToStorage() {
  try {
    localStorage.setItem('syafina_cart', JSON.stringify(State.cart));
  } catch (e) { /* ignore */ }
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('syafina_cart');
    if (saved) State.cart = JSON.parse(saved);
  } catch (e) { State.cart = []; }
}

// Cart drawer
$('#cartToggle').addEventListener('click', () => {
  renderCart();
  openDrawer($('#cartDrawer'));
});
$('#cartDrawerClose').addEventListener('click', () => closeDrawer($('#cartDrawer')));
$('#cartDrawerOverlay').addEventListener('click', () => closeDrawer($('#cartDrawer')));

/* ===== WISHLIST ===== */
function toggleWishlist(productId) {
  const index = State.wishlist.indexOf(productId);
  if (index > -1) {
    State.wishlist.splice(index, 1);
    showToast('Dihapus dari wishlist', 'info');
    if (State.isBackendAvailable && State.user) {
      API.removeWishlist(productId).catch(() => {});
    }
  } else {
    State.wishlist.push(productId);
    showToast('Ditambahkan ke wishlist', 'success');
    if (State.isBackendAvailable && State.user) {
      API.addWishlist(productId).catch(() => {});
    }
  }

  saveWishlistToStorage();
  updateWishlistBadge();
  renderWishlist();
  updateWishlistButton();
  // Re-render product cards to update icons
  renderHomeProducts();
  if (State.currentSection === 'shop') renderShopProducts();
}

async function syncWishlist() {
  if (!State.isBackendAvailable || !State.user) return;
  try {
    const data = await API.getWishlist();
    const serverWishlist = (data.wishlist || data || []).map(w => w.product_id || w.id);
    // Merge local and server
    const merged = [...new Set([...State.wishlist, ...serverWishlist])];
    State.wishlist = merged;
    saveWishlistToStorage();
    updateWishlistBadge();
  } catch { /* ignore */ }
}

function renderWishlist() {
  const container = $('#wishlistItems');
  const empty = $('#wishlistEmpty');
  container.innerHTML = '';

  const wishlistProducts = State.products.filter(p => State.wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  wishlistProducts.forEach(product => {
    const el = document.createElement('div');
    el.className = 'wishlist-item';
    el.innerHTML = `
      <div class="wishlist-item__image"><img src="${sanitize(product.image)}" alt="${sanitize(product.name)}" onerror="handleImageError(this)"></div>
      <div class="wishlist-item__info">
        <p class="wishlist-item__name">${sanitize(product.name)}</p>
        <p class="wishlist-item__price">${formatPrice(product.discount_price || product.price)}</p>
      </div>
      <div class="wishlist-item__actions">
        <button class="wishlist-item__btn wishlist-item__btn--cart" aria-label="Tambah ke keranjang"><i class="fas fa-shopping-bag"></i></button>
        <button class="wishlist-item__btn wishlist-item__btn--remove" aria-label="Hapus dari wishlist"><i class="fas fa-times"></i></button>
      </div>
    `;

    el.querySelector('.wishlist-item__image').addEventListener('click', () => {
      closeDrawer($('#wishlistDrawer'));
      openProductDetail(product.id);
    });

    el.querySelector('.wishlist-item__btn--cart').addEventListener('click', () => {
      quickAddToCart(product.id);
    });

    el.querySelector('.wishlist-item__btn--remove').addEventListener('click', () => {
      toggleWishlist(product.id);
    });

    container.appendChild(el);
  });
}

function updateWishlistBadge() {
  const badge = $('#wishlistBadge');
  badge.textContent = State.wishlist.length;
  badge.style.display = State.wishlist.length > 0 ? 'flex' : 'none';
}

function saveWishlistToStorage() {
  try {
    localStorage.setItem('syafina_wishlist', JSON.stringify(State.wishlist));
  } catch (e) { /* ignore */ }
}

function loadWishlistFromStorage() {
  try {
    const saved = localStorage.getItem('syafina_wishlist');
    if (saved) State.wishlist = JSON.parse(saved);
  } catch (e) { State.wishlist = []; }
}

// Wishlist drawer
$('#wishlistToggle').addEventListener('click', () => {
  renderWishlist();
  openDrawer($('#wishlistDrawer'));
});
$('#wishlistDrawerClose').addEventListener('click', () => closeDrawer($('#wishlistDrawer')));
$('#wishlistDrawerOverlay').addEventListener('click', () => closeDrawer($('#wishlistDrawer')));

/* ===== FILTERS ===== */
function initFilters() {
  // Filter inputs
  $('#filterSearch').addEventListener('input', debounce(() => {
    State.filters.search = $('#filterSearch').value;
    renderShopProducts();
  }, 300));

  // Category checkboxes
  $('#filterCategory').addEventListener('change', () => {
    updateFilters();
    renderShopProducts();
  });

  // Color checkboxes
  $('#filterColor').addEventListener('change', () => {
    updateFilters();
    renderShopProducts();
  });

  // Price
  $('#filterPriceMin').addEventListener('input', debounce(() => renderShopProducts(), 500));
  $('#filterPriceMax').addEventListener('input', debounce(() => renderShopProducts(), 500));

  // Sort
  $('#filterSort').addEventListener('change', () => renderShopProducts());

  // Reset
  $('#resetFilters').addEventListener('click', resetFilters);
  $('#resetFiltersEmpty').addEventListener('click', resetFilters);

  // Mobile filter toggle
  $('#filterToggleMobile').addEventListener('click', () => {
    const filters = $('#shopFilters');
    filters.classList.toggle('active');
  });
}

function updateFilters() {
  // This is called after manual changes to keep state in sync
}

function resetFilters() {
  $('#filterSearch').value = '';
  State.filters.search = '';
  $$('#filterCategory input').forEach(cb => cb.checked = false);
  $$('#filterSize .filter-option--size').forEach(b => b.classList.remove('active'));
  $$('#filterColor input').forEach(cb => cb.checked = false);
  $('#filterPriceMin').value = '';
  $('#filterPriceMax').value = '';
  $('#filterSort').value = 'default';
  renderShopProducts();
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ===== AUTH ===== */
function initAuthForms() {
  const modal = $('#authModal');
  const closeBtn = $('#authModalClose');
  const overlay = $('#authModalOverlay');

  // Account toggle
  $('#accountToggle').addEventListener('click', () => {
    if (State.user) {
      openAccountDrawer();
    } else {
      showLoginForm();
      openModal(modal);
    }
  });

  [closeBtn, overlay].forEach(el => {
    el.addEventListener('click', () => closeModal(modal));
  });

  // Switch forms
  $('#showRegister').addEventListener('click', () => showRegisterForm());
  $('#showLogin').addEventListener('click', () => showLoginForm());
  $('#backToLogin').addEventListener('click', () => showLoginForm());
  $('#showForgotPassword').addEventListener('click', () => {
    $('#loginForm').style.display = 'none';
    $('#registerForm').style.display = 'none';
    $('#forgotPasswordForm').style.display = 'block';
  });

  // Login
  $('#loginFormEl').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value;

    // Validate
    let valid = true;
    if (!email || !isValidEmail(email)) {
      $('#loginEmailError').textContent = 'Masukkan email yang valid';
      valid = false;
    } else {
      $('#loginEmailError').textContent = '';
    }
    if (!password) {
      $('#loginPasswordError').textContent = 'Password wajib diisi';
      valid = false;
    } else {
      $('#loginPasswordError').textContent = '';
    }
    if (!valid) return;

    setLoading($('#loginSubmit'), true);
    try {
      const data = await API.login({ email, password });
      State.user = data.user;
      updateAuthUI();
      closeModal(modal);
      showToast('Login berhasil!', 'success');
      await syncWishlist();
      renderHomeProducts();
      if (State.currentSection === 'shop') renderShopProducts();
    } catch (err) {
      showAlert('#loginAlert', err.message || 'Login gagal', 'error');
    } finally {
      setLoading($('#loginSubmit'), false);
    }
  });

  // Register
  $('#registerFormEl').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#registerName').value.trim();
    const email = $('#registerEmail').value.trim();
    const phone = $('#registerPhone').value.trim();
    const password = $('#registerPassword').value;
    const confirmPassword = $('#registerConfirmPassword').value;

    // Validate
    let valid = true;
    if (!name) { $('#registerNameError').textContent = 'Nama wajib diisi'; valid = false; } else { $('#registerNameError').textContent = ''; }
    if (!email || !isValidEmail(email)) { $('#registerEmailError').textContent = 'Masukkan email yang valid'; valid = false; } else { $('#registerEmailError').textContent = ''; }
    if (!password || password.length < 8) { $('#registerPasswordError').textContent = 'Password minimal 8 karakter'; valid = false; } else { $('#registerPasswordError').textContent = ''; }
    if (password !== confirmPassword) { $('#registerConfirmPasswordError').textContent = 'Konfirmasi password tidak sesuai'; valid = false; } else { $('#registerConfirmPasswordError').textContent = ''; }
    if (!valid) return;

    setLoading($('#registerSubmit'), true);
    try {
      await API.register({ name, email, phone, password });
      showAlert('#registerAlert', 'Registrasi berhasil! Silakan login.', 'success');
      setTimeout(() => showLoginForm(), 2000);
    } catch (err) {
      showAlert('#registerAlert', err.message || 'Registrasi gagal', 'error');
    } finally {
      setLoading($('#registerSubmit'), false);
    }
  });
}

function showLoginForm() {
  $('#loginForm').style.display = 'block';
  $('#registerForm').style.display = 'none';
  $('#forgotPasswordForm').style.display = 'none';
  clearAuthErrors();
}

function showRegisterForm() {
  $('#loginForm').style.display = 'none';
  $('#registerForm').style.display = 'block';
  $('#forgotPasswordForm').style.display = 'none';
  clearAuthErrors();
}

function clearAuthErrors() {
  $$('.auth-form .form-error').forEach(el => el.textContent = '');
  $$('.auth-form__alert').forEach(el => { el.className = 'auth-form__alert'; el.textContent = ''; });
}

function showAlert(selector, message, type) {
  const el = $(selector);
  el.textContent = message;
  el.className = `auth-form__alert ${type}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ===== ACCOUNT DRAWER ===== */
function openAccountDrawer() {
  if (!State.user) {
    openModal($('#authModal'));
    return;
  }

  $('#accountName').textContent = State.user.name || '';
  $('#accountEmail').textContent = State.user.email || '';
  $('#accountPhone').textContent = State.user.phone || '';

  loadOrders();
  openDrawer($('#accountDrawer'));
}

$('#accountDrawerClose').addEventListener('click', () => closeDrawer($('#accountDrawer')));
$('#accountDrawerOverlay').addEventListener('click', () => closeDrawer($('#accountDrawer')));

$('#logoutBtn').addEventListener('click', async () => {
  try {
    if (State.isBackendAvailable) await API.logout();
  } catch { /* ignore */ }
  State.user = null;
  updateAuthUI();
  closeDrawer($('#accountDrawer'));
  showToast('Berhasil keluar', 'info');
});

async function loadOrders() {
  const container = $('#ordersList');
  const empty = $('#ordersEmpty');

  if (!State.isBackendAvailable || !State.user) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  try {
    const data = await API.getOrders();
    const orders = data.orders || data || [];

    if (orders.length === 0) {
      container.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    container.innerHTML = '';

    orders.forEach(order => {
      const statusMap = {
        'pending': { label: 'Menunggu Pembayaran', class: 'pending' },
        'confirmed': { label: 'Pembayaran Dikonfirmasi', class: 'confirmed' },
        'processing': { label: 'Diproses', class: 'processing' },
        'shipped': { label: 'Dikirim', class: 'shipped' },
        'completed': { label: 'Selesai', class: 'completed' },
        'cancelled': { label: 'Dibatalkan', class: 'cancelled' }
      };
      const status = statusMap[order.order_status] || statusMap['pending'];
      const date = new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      const card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML = `
        <div class="order-card__header">
          <div>
            <p class="order-card__number">#${sanitize(order.order_number)}</p>
            <p class="order-card__date">${date}</p>
          </div>
          <span class="order-card__status order-card__status--${status.class}">${status.label}</span>
        </div>
        <p class="order-card__items">${order.item_count || '?'} item</p>
        <p class="order-card__total">${formatPrice(order.grand_total)}</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '';
    empty.style.display = 'block';
  }
}

/* ===== CHECKOUT ===== */
function initCheckout() {
  const modal = $('#checkoutModal');
  const closeBtn = $('#checkoutModalClose');
  const overlay = $('#checkoutModalOverlay');

  [closeBtn, overlay].forEach(el => {
    el.addEventListener('click', () => closeModal(modal));
  });

  $('#checkoutBtn').addEventListener('click', () => {
    closeDrawer($('#cartDrawer'));
    openCheckout();
  });

  // Shipping method change
  $$('input[name="shipping"]').forEach(radio => {
    radio.addEventListener('change', () => updateCheckoutTotals());
  });

  // Place order
  $('#placeOrderBtn').addEventListener('click', placeOrder);

  // Order success
  $('#orderSuccessOverlay').addEventListener('click', () => closeModal($('#orderSuccessModal')));
  $('#viewOrderBtn').addEventListener('click', () => {
    closeModal($('#orderSuccessModal'));
    if (State.user) openAccountDrawer();
  });
}

function openCheckout() {
  if (State.cart.length === 0) {
    showToast('Keranjang belanja kosong', 'warning');
    return;
  }

  if (!State.user && State.isBackendAvailable) {
    showToast('Silakan login terlebih dahulu', 'info');
    openModal($('#authModal'));
    return;
  }

  const modal = $('#checkoutModal');

  // Pre-fill if user logged in
  if (State.user) {
    $('#checkoutName').value = State.user.name || '';
    $('#checkoutEmail').value = State.user.email || '';
    $('#checkoutPhone').value = State.user.phone || '';
  }

  renderCheckoutItems();
  updateCheckoutTotals();
  openModal(modal);
}

function renderCheckoutItems() {
  const container = $('#checkoutItems');
  container.innerHTML = '';

  State.cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'checkout__item';
    el.innerHTML = `
      <div class="checkout__item-image"><img src="${sanitize(item.image)}" alt="${sanitize(item.name)}" onerror="handleImageError(this)"></div>
      <div class="checkout__item-info">
        <p class="checkout__item-name">${sanitize(item.name)}</p>
        <p class="checkout__item-variant">${sanitize(item.size)}${item.color ? ' · ' + sanitize(item.color) : ''} × ${item.quantity}</p>
      </div>
      <p class="checkout__item-price">${formatPrice(item.price * item.quantity)}</p>
    `;
    container.appendChild(el);
  });
}

function updateCheckoutTotals() {
  const subtotal = State.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingMethod = $('input[name="shipping"]:checked')?.value || 'regular';
  const shippingCost = CONFIG.SHIPPING_COSTS[shippingMethod] || 15000;
  const grandTotal = subtotal + shippingCost;

  $('#checkoutSubtotal').textContent = formatPrice(subtotal);
  $('#checkoutShipping').textContent = formatPrice(shippingCost);
  $('#checkoutGrandTotal').textContent = formatPrice(grandTotal);
}

let isPlacingOrder = false;

async function placeOrder() {
  if (isPlacingOrder) return;

  // Validate
  const name = $('#checkoutName').value.trim();
  const phone = $('#checkoutPhone').value.trim();
  const address = $('#checkoutAddress').value.trim();
  const province = $('#checkoutProvince').value.trim();
  const city = $('#checkoutCity').value.trim();

  let valid = true;
  const showErr = (id, msg) => { $(`#${id}`).textContent = msg; };
  const clearErr = (id) => { $(`#${id}`).textContent = ''; };

  if (!name) { showErr('checkoutNameError', 'Nama penerima wajib diisi'); valid = false; } else { clearErr('checkoutNameError'); }
  if (!phone || phone.length < 8) { showErr('checkoutPhoneError', 'Nomor telepon tidak valid'); valid = false; } else { clearErr('checkoutPhoneError'); }
  if (!address) { showErr('checkoutAddressError', 'Alamat wajib diisi'); valid = false; } else { clearErr('checkoutAddressError'); }
  if (!province) { showErr('checkoutProvinceError', 'Provinsi wajib diisi'); valid = false; } else { clearErr('checkoutProvinceError'); }
  if (!city) { showErr('checkoutCityError', 'Kota wajib diisi'); valid = false; } else { clearErr('checkoutCityError'); }

  if (!valid) return;

  isPlacingOrder = true;
  setLoading($('#placeOrderBtn'), true);

  const shippingMethod = $('input[name="shipping"]:checked')?.value || 'regular';
  const paymentMethod = $('input[name="payment"]:checked')?.value || 'bank_transfer';

  const orderData = {
    recipient_name: name,
    phone,
    email: $('#checkoutEmail').value.trim(),
    shipping_address: `${address}, ${$('#checkoutDistrict').value.trim()}, ${city}, ${province} ${$('#checkoutPostal').value.trim()}`.trim(),
    notes: $('#checkoutNotes').value.trim(),
    shipping_method: shippingMethod,
    shipping_cost: CONFIG.SHIPPING_COSTS[shippingMethod],
    payment_method: paymentMethod,
    items: State.cart.map(item => ({
      product_id: item.product_id,
      size: item.size,
      color: item.color,
      quantity: item.quantity
    }))
  };

  try {
    if (State.isBackendAvailable && State.user) {
      const data = await API.createOrder(orderData);
      const order = data.order || data;

      // Show success
      closeModal($('#checkoutModal'));
      showOrderSuccess(order);
    } else {
      // Demo mode
      const demoOrder = {
        order_number: 'SYF-' + Date.now().toString(36).toUpperCase(),
        grand_total: State.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (CONFIG.SHIPPING_COSTS[shippingMethod] || 15000),
        order_status: 'pending',
        payment_status: 'pending'
      };

      closeModal($('#checkoutModal'));
      showOrderSuccess(demoOrder);
    }

    // Clear cart
    State.cart = [];
    saveCartToStorage();
    updateCartBadge();
    renderCart();
  } catch (err) {
    const alertEl = $('#checkoutAlert');
    alertEl.textContent = err.message || 'Gagal membuat pesanan. Silakan coba lagi.';
    alertEl.className = 'checkout__alert error';
  } finally {
    isPlacingOrder = false;
    setLoading($('#placeOrderBtn'), false);
  }
}

function showOrderSuccess(order) {
  const details = $('#orderSuccessDetails');
  details.innerHTML = `
    <p><span>Nomor Pesanan</span><strong>${sanitize(order.order_number)}</strong></p>
    <p><span>Total</span><strong>${formatPrice(order.grand_total)}</strong></p>
    <p><span>Status</span><strong>Menunggu Pembayaran</strong></p>
  `;
  openModal($('#orderSuccessModal'));
}

/* ===== MODAL & DRAWER HELPERS ===== */
function openModal(modal) {
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  // Focus trap
  const firstFocusable = modal.querySelector('button, input, select, textarea, a[href]');
  if (firstFocusable) setTimeout(() => firstFocusable.focus(), 100);
}

function closeModal(modal) {
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

function openDrawer(drawer) {
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

function closeDrawer(drawer) {
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

function closeAllDrawers() {
  $$('.drawer').forEach(d => closeDrawer(d));
}

// Global escape key handler
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $$('.modal[aria-hidden="false"]').forEach(m => closeModal(m));
    $$('.drawer[aria-hidden="false"]').forEach(d => closeDrawer(d));
    closeMobileMenu();
  }
});
