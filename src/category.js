import { products } from './products.js';

const currentCategory = document.title.split(" - ")[0];

const list = document.getElementById("product-list");
const sortSelect = document.getElementById("sort");
const minSlider = document.getElementById("min-price");
const maxSlider = document.getElementById("max-price");
const priceDisplay = document.getElementById("price-range-display");

function renderProducts(filtered) {
  list.innerHTML = "";
  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image" style="background-image: url('${p.image}'); background-size: 70%; background-position: center; background-repeat: no-repeat;"></div>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p class="price">$${p.price.toFixed(2)}</p>
      <button class="add-to-cart">Add to Cart</button>
    `;
    list.appendChild(card);
  });
}

function applyFilters() {
  const sort = sortSelect.value;
  const min = parseFloat(minSlider.value);
  const max = parseFloat(maxSlider.value);

  priceDisplay.textContent = `$${min} - $${max}`;

  let filtered = products.filter(p => 
    p.category === currentCategory &&
    p.price >= min &&
    p.price <= max
  );

  if (sort === "asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "desc") filtered.sort((a, b) => b.price - a.price);

  renderProducts(filtered);
}

sortSelect.addEventListener("change", applyFilters);
minSlider.addEventListener("input", applyFilters);
maxSlider.addEventListener("input", applyFilters);

applyFilters();

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function updateCartCount() {
  const count = getCart().length;
  const countElem = document.getElementById("cart-count");
  if (countElem) countElem.textContent = count;
}

function handleAddToCart(event) {
  const card = event.target.closest(".product-card");
  const name = card.querySelector("h3").textContent;
  const price = card.querySelector(".price").textContent;
  const imageStyle = card.querySelector(".product-image").style.backgroundImage;
  const imageUrl = imageStyle.slice(5, -2);

  const cart = getCart();
  cart.push({ name, price, image: imageUrl });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  const note = document.getElementById("cart-notification");
  const cartButton = document.querySelector(".cart-button");
  if (note && cartButton) {
    note.style.display = "block";
    cartButton.classList.add("cart-animate");
    setTimeout(() => {
      note.style.display = "none";
      cartButton.classList.remove("cart-animate");
    }, 1300);
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart")) {
    handleAddToCart(e);
  }
});

document.addEventListener("DOMContentLoaded", updateCartCount);
