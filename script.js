"use strict";

const CART_KEY = "ecomercio-cart";
const ORDERS_KEY = "ecomercio-orders";
const SESSION_KEY = "ecomercio-session";

const PRODUCTS = [
  {
    id: "laptop",
    name: "Laptop milonizada",
    price: 12323,
    compare: 15404,
    rating: 5,
    reviews: 128,
    image: "img/1-laptop.avif",
    category: "laptops",
    categoryLabel: "Laptops",
  },
  {
    id: "celular",
    name: "Celular milonizado",
    price: 23456,
    compare: 27595,
    rating: 4,
    reviews: 96,
    image: "img/2-celular.avif",
    category: "celulares",
    categoryLabel: "Celulares",
  },
  {
    id: "television",
    name: "Televisor milonizado",
    price: 45678,
    compare: 57098,
    rating: 5,
    reviews: 77,
    image: "img/3-television.avif",
    category: "televisores",
    categoryLabel: "Televisores",
  },
  {
    id: "cpu",
    name: "CPU milonizado",
    price: 67890,
    compare: 79871,
    rating: 4,
    reviews: 64,
    image: "img/4-cpu.png",
    category: "computacion",
    categoryLabel: "Computación",
  },
];

const NAV = [
  { page: "inicio", href: "index.html", label: "Inicio" },
  { page: "productos", href: "productos.html", label: "Productos" },
  { href: "index.html#categorias", label: "Categorías" },
  { href: "index.html#ofertas", label: "Ofertas" },
  { page: "compras", href: "compras.html", label: "Mis compras" },
  { href: "index.html#contacto", label: "Contacto" },
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function formatMoney(value) {
  const formatted = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value);
  return `$ ${formatted}`;
}

function discountOf(product) {
  return Math.round((1 - product.price / product.compare) * 100);
}

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showToast("No se pudo guardar en este navegador");
    return false;
  }
}

function getCart() {
  const value = readJSON(CART_KEY);
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item.id === "string" && Number.isInteger(item.qty) && item.qty > 0);
}

function getOrders() {
  const value = readJSON(ORDERS_KEY);
  return Array.isArray(value) ? value : [];
}

function getSession() {
  const value = readJSON(SESSION_KEY);
  if (!value || typeof value.name !== "string" || typeof value.email !== "string") return null;
  return value;
}

function cartCount() {
  return getCart().reduce((total, item) => total + item.qty, 0);
}

function findProduct(id) {
  return PRODUCTS.find((product) => product.id === id);
}

function icon(paths) {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${paths}</svg>`;
}

function iconSearch() {
  return icon('<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path>');
}

function iconUser() {
  return icon('<circle cx="12" cy="8" r="3.2"></circle><path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19"></path>');
}

function iconCart() {
  return icon('<circle cx="9" cy="19" r="1.4"></circle><circle cx="17" cy="19" r="1.4"></circle><path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8H17a1 1 0 0 0 1-.8L20 8H7"></path>');
}

let toastTimer = 0;

function showToast(message) {
  let toast = document.querySelector("#toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function updateCartBadges() {
  const count = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = String(count);
    badge.classList.toggle("is-empty", count === 0);
  });
}

function saveCart(cart) {
  if (!writeJSON(CART_KEY, cart)) return;
  updateCartBadges();
}

function addToCart(id) {
  if (!findProduct(id)) return;
  const cart = getCart();
  const item = cart.find((entry) => entry.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  if (document.querySelector("#cart-root")) renderCart();
  showToast("Producto agregado al carrito");
}

function changeQty(id, delta) {
  const cart = getCart()
    .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
    .filter((item) => item.qty > 0);
  saveCart(cart);
  renderCart();
}

function removeFromCart(id) {
  saveCart(getCart().filter((item) => item.id !== id));
  renderCart();
}

function starsMarkup(rating) {
  const on = "★".repeat(rating);
  const off = "★".repeat(5 - rating);
  return `<span class="star is-on" aria-hidden="true">${on}</span><span class="star" aria-hidden="true">${off}</span>`;
}

function cardMarkup(product, withId) {
  const discount = discountOf(product);
  return `
    <article class="card"${withId ? ` id="${product.id}"` : ""}>
      <span class="discount">-${discount}%</span>
      <a href="productos.html#${product.id}">
        <img class="product-photo" src="${product.image}" alt="${escapeHtml(product.name)}">
      </a>
      <h3><a href="productos.html#${product.id}">${escapeHtml(product.name)}</a></h3>
      <p class="rating">
        ${starsMarkup(product.rating)}
        <span class="reviews">(${product.reviews})</span>
        <span class="sr-only">${product.rating} de 5 estrellas</span>
      </p>
      <p class="price">
        <strong>${formatMoney(product.price)}</strong>
        <s>${formatMoney(product.compare)}</s>
      </p>
      <button class="btn" type="button" data-add="${product.id}">
        ${iconCart()} Agregar al carrito
      </button>
    </article>`;
}

function headerMarkup(page) {
  const count = cartCount();
  const session = getSession();
  const accountLabel = session ? escapeHtml(session.name.split(" ")[0]) : "Mi cuenta";
  const links = NAV.map((item) => {
    const current = item.page && item.page === page ? ' aria-current="page"' : "";
    return `<li><a href="${item.href}"${current}>${item.label}</a></li>`;
  }).join("");

  return `
    <header class="site-header">
      <div class="topbar container">
        <a class="brand" href="index.html">
          <img src="img/logo.png" alt="e-comercio">
        </a>
        <form class="search" action="productos.html" method="get" role="search">
          <label class="sr-only" for="searchInput">Buscar productos</label>
          <input id="searchInput" name="q" type="search" placeholder="Buscar productos..." autocomplete="off">
          <button type="submit" data-search aria-label="Buscar">${iconSearch()}</button>
        </form>
        <div class="top-actions">
          <a href="login.html"${page === "login" ? ' aria-current="page"' : ""}>
            ${iconUser()} ${accountLabel}
          </a>
          <a class="cart-link" href="carrito.html"${page === "carrito" ? ' aria-current="page"' : ""}>
            <span class="icon-wrap">
              ${iconCart()}
              <span class="cart-badge${count ? "" : " is-empty"}" data-cart-count>${count}</span>
            </span>
            Carrito
          </a>
        </div>
      </div>
      <nav class="subnav" aria-label="Secciones">
        <ul class="container">${links}</ul>
      </nav>
    </header>`;
}

function footerMarkup() {
  return `
    <footer class="site-footer" id="contacto">
      <div class="container footer-inner">
        <img src="img/logo.png" alt="e-comercio">
        <div>
          <p>© 2026 e-comercio. Todos los derechos reservados.</p>
          <p>Contacto: <a href="mailto:camilocalcaraz21@gmail.com">camilocalcaraz21@gmail.com</a></p>
          <p>Dirección: Ramallo, Buenos Aires, Argentina</p>
          <p>Teléfono: <a href="tel:+54934074017">+54934074017</a></p>
        </div>
      </div>
    </footer>`;
}

function renderChrome() {
  const page = document.body.dataset.page || "";
  const header = document.querySelector("#chrome-header");
  const footer = document.querySelector("#chrome-footer");
  if (header) header.innerHTML = headerMarkup(page);
  if (footer) footer.innerHTML = footerMarkup();
  const query = new URLSearchParams(location.search).get("q");
  const input = document.querySelector("#searchInput");
  if (input && query) input.value = query;
}

function renderCategories() {
  const root = document.querySelector("#category-grid");
  if (!root) return;
  root.innerHTML = PRODUCTS.map((product) => `
    <a class="category" href="productos.html?cat=${product.category}">
      <img src="${product.image}" alt="">
      <span>${escapeHtml(product.categoryLabel)}</span>
    </a>
  `).join("");
}

function renderOffers() {
  const root = document.querySelector("#offer-grid");
  if (!root) return;
  root.innerHTML = PRODUCTS.map((product) => cardMarkup(product, false)).join("");
}

function initHero() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const slides = [...hero.querySelectorAll(".hero-slide")];
  const dotsRoot = hero.querySelector(".hero-dots");
  if (!slides.length || !dotsRoot) return;

  let index = 0;
  let timer = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  dotsRoot.innerHTML = slides.map((_, dotIndex) => (
    `<button type="button" aria-label="Ir a la diapositiva ${dotIndex + 1}"></button>`
  )).join("");
  const dots = [...dotsRoot.querySelectorAll("button")];

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function stop() {
    window.clearInterval(timer);
  }

  function play() {
    if (reduced) return;
    stop();
    timer = window.setInterval(() => show(index + 1), 6500);
  }

  hero.querySelector(".hero-prev")?.addEventListener("click", () => show(index - 1));
  hero.querySelector(".hero-next")?.addEventListener("click", () => show(index + 1));
  dots.forEach((dot, dotIndex) => dot.addEventListener("click", () => show(dotIndex)));
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", play);
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", play);
  show(0);
  play();
}

function initCatalog() {
  const grid = document.querySelector("#catalog-grid");
  if (!grid) return;
  const params = new URLSearchParams(location.search);
  const query = (params.get("q") || "").trim().toLowerCase();
  const category = (params.get("cat") || "").trim().toLowerCase();
  const items = PRODUCTS.filter((product) => {
    const matchesQuery = !query || `${product.name} ${product.categoryLabel}`.toLowerCase().includes(query);
    const matchesCategory = !category || product.category === category;
    return matchesQuery && matchesCategory;
  });

  const title = document.querySelector("#catalog-title");
  const count = document.querySelector("#catalog-count");
  const categoryLabel = PRODUCTS.find((product) => product.category === category)?.categoryLabel;

  if (title) {
    if (query) title.textContent = `Resultados para “${params.get("q").trim()}”`;
    else if (categoryLabel) title.textContent = categoryLabel;
    else title.textContent = "Productos";
  }

  if (query) document.title = `Buscar: ${params.get("q").trim()} | e-comercio`;
  else if (categoryLabel) document.title = `${categoryLabel} | e-comercio`;

  if (count) {
    count.textContent = items.length === 1 ? "1 producto" : `${items.length} productos`;
  }

  if (!items.length) {
    grid.innerHTML = `<div class="empty"><p>No encontramos productos para esa búsqueda.</p><a class="btn" href="productos.html">Ver todos</a></div>`;
    return;
  }

  grid.innerHTML = items.map((product) => cardMarkup(product, true)).join("");
  const hashId = location.hash.slice(1);
  if (PRODUCTS.some((product) => product.id === hashId)) {
    document.getElementById(hashId)?.scrollIntoView({ block: "center" });
  }
}

function lineTotal(item) {
  const product = findProduct(item.id);
  return product ? product.price * item.qty : 0;
}

function renderCart() {
  const root = document.querySelector("#cart-root");
  if (!root) return;
  const cart = getCart();
  if (!cart.length) {
    root.innerHTML = `
      <div class="empty">
        <p>Tu carrito está vacío.</p>
        <a class="btn" href="productos.html">Ver productos</a>
      </div>`;
    return;
  }

  const rows = cart.map((item) => {
    const product = findProduct(item.id);
    if (!product) return "";
    return `
      <article class="cart-item">
        <img src="${product.image}" alt="">
        <div>
          <h2>${escapeHtml(product.name)}</h2>
          <p class="line-price">${formatMoney(product.price)}</p>
        </div>
        <div class="qty">
          <button type="button" data-qty="${product.id}" data-delta="-1" aria-label="Quitar uno">−</button>
          <span>${item.qty}</span>
          <button type="button" data-qty="${product.id}" data-delta="1" aria-label="Agregar uno">+</button>
        </div>
        <strong class="line-total">${formatMoney(lineTotal(item))}</strong>
        <button class="remove" type="button" data-remove="${product.id}" aria-label="Quitar ${escapeHtml(product.name)}">×</button>
      </article>`;
  }).join("");

  const total = cart.reduce((sum, item) => sum + lineTotal(item), 0);
  root.innerHTML = `
    <div class="cart-layout">
      <div class="panel">${rows}</div>
      <aside class="summary">
        <h2>Resumen</h2>
        <div class="summary-row"><span>Productos</span><span>${cartCount()}</span></div>
        <div class="summary-row summary-total"><span>Total</span><span>${formatMoney(total)}</span></div>
        <button class="btn" type="button" data-checkout>Confirmar pedido</button>
        <a class="btn btn-ghost" href="productos.html">Seguir comprando</a>
        <p class="fine">Este pedido es una demostración y no genera un cobro.</p>
      </aside>
    </div>`;
  bindCartActions(root);
}

function bindCartActions(root) {
  root.querySelectorAll("[data-delta]").forEach((button) => {
    button.addEventListener("click", () => {
      changeQty(button.dataset.qty, Number(button.dataset.delta));
    });
  });
  root.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      removeFromCart(button.dataset.remove);
    });
  });
  root.querySelector("[data-checkout]")?.addEventListener("click", checkout);
}

function isPlainClick(event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  return event.button === 0 || event.button == null;
}

function goToSearch(form) {
  const query = String(form?.querySelector("[name=q]")?.value || "").trim();
  const url = query ? `productos.html?q=${encodeURIComponent(query)}` : "productos.html";
  const onCatalog = /(?:^|\/)productos\.html$/i.test(location.pathname);
  if (onCatalog) {
    history.pushState(null, "", url);
    initCatalog();
    document.querySelector("#contenido")?.scrollIntoView();
    return;
  }
  location.href = url;
}

function checkout() {
  const cart = getCart();
  if (!cart.length) return;
  const orders = getOrders();
  orders.unshift({
    id: Date.now(),
    createdAt: new Date().toISOString(),
    items: cart.map((item) => ({ id: item.id, qty: item.qty })),
  });
  if (!writeJSON(ORDERS_KEY, orders)) return;
  saveCart([]);
  location.href = "compras.html?nuevo=1";
}

function initOrders() {
  const root = document.querySelector("#orders-root");
  if (!root) return;
  const orders = getOrders();
  const banner = new URLSearchParams(location.search).get("nuevo")
    ? `<p class="notice">Pedido de demostración registrado. No se realizó ningún pago.</p>`
    : "";

  if (!orders.length) {
    root.innerHTML = `
      ${banner}
      <div class="empty">
        <p>Todavía no tienes compras registradas.</p>
        <a class="btn" href="productos.html">Ver productos</a>
      </div>`;
    return;
  }

  const when = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" });
  root.innerHTML = banner + orders.map((order) => {
    const lines = (order.items || []).map((item) => {
      const product = findProduct(item.id);
      const name = product ? product.name : "Producto";
      return `<li><span>${escapeHtml(name)} × ${item.qty}</span><span>${formatMoney(lineTotal(item))}</span></li>`;
    }).join("");
    const total = (order.items || []).reduce((sum, item) => sum + lineTotal(item), 0);
    return `
      <article class="order">
        <h2>Pedido del ${when.format(new Date(order.createdAt))}</h2>
        <ul>${lines}</ul>
        <p class="order-total">Total ${formatMoney(total)}</p>
      </article>`;
  }).join("");
}

function renderAccount() {
  const root = document.querySelector("#account-root");
  if (!root) return;
  const session = getSession();
  if (session) {
    root.innerHTML = `
      <div class="account-card">
        <h2>Hola, ${escapeHtml(session.name)}</h2>
        <p class="muted">${escapeHtml(session.email)}</p>
        <p class="hint">Esta sesión vive solo en este navegador.</p>
        <div class="account-actions">
          <a class="btn" href="compras.html">Mis compras</a>
          <a class="btn btn-ghost" href="carrito.html">Ver carrito</a>
          <button class="btn btn-ghost" type="button" id="logout">Cerrar sesión</button>
        </div>
      </div>`;
    document.querySelector("#logout")?.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      renderChrome();
      renderAccount();
      showToast("Sesión cerrada");
    });
    return;
  }

  root.innerHTML = `
    <form class="account-card" id="account-form">
      <h2>Entrar o crear una cuenta</h2>
      <p class="hint">Demo local: la contraseña no se guarda.</p>
      <p class="form-error" id="account-error"></p>
      <label class="field-label" for="account-name">Nombre</label>
      <input class="field" id="account-name" name="name" type="text" autocomplete="name" required>
      <label class="field-label" for="account-email">Correo</label>
      <input class="field" id="account-email" name="email" type="email" autocomplete="email" required>
      <label class="field-label" for="account-password">Contraseña</label>
      <input class="field" id="account-password" name="password" type="password" autocomplete="current-password" required>
      <p class="hint">Usa al menos 4 caracteres. Solo se comprueba en esta página y no queda almacenada.</p>
      <button class="btn" type="submit">Continuar</button>
    </form>`;

  document.querySelector("#account-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const error = document.querySelector("#account-error");
    if (name.length < 2) {
      error.textContent = "Escribe tu nombre.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error.textContent = "Escribe un correo válido.";
      return;
    }
    if (password.length < 4) {
      error.textContent = "La contraseña debe tener al menos 4 caracteres.";
      return;
    }
    if (!writeJSON(SESSION_KEY, { name, email })) return;
    renderChrome();
    renderAccount();
    showToast("Sesión de demostración iniciada");
  });
}

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.classList.contains("search")) return;
  event.preventDefault();
  goToSearch(form);
});

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  if (!target || !isPlainClick(event)) return;

  const searchButton = target.closest("[data-search]");
  if (searchButton) {
    event.preventDefault();
    goToSearch(searchButton.closest("form"));
    return;
  }

  const cartLink = target.closest("a.cart-link, a[href='carrito.html']");
  if (cartLink) {
    event.preventDefault();
    location.href = "carrito.html";
    return;
  }

  const addButton = target.closest("[data-add]");
  if (addButton) {
    addToCart(addButton.dataset.add);
  }
});

renderChrome();
renderCategories();
renderOffers();
initHero();
initCatalog();
renderCart();
initOrders();
renderAccount();
