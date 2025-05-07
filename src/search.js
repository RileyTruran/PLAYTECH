import { products } from './products.js';

const params = new URLSearchParams(window.location.search);
const query = params.get('query')?.toLowerCase() || '';
const productList = document.getElementById('product-list');
const summary = document.getElementById('search-summary');
const cartCount = document.getElementById('cart-count');

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCartCount() {
  cartCount.textContent = getCart().length;
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <div class="product-image" style="
      background-image: url('${product.image}');
      background-size: 70%;
      background-position: center;
      background-repeat: no-repeat;"></div>
    <h3>${product.name}</h3>
    <p>${product.description}</p>
    <p class="price">$${product.price.toFixed(2)}</p>
    <button class="add-to-cart">Add to Cart</button>
  `;
  card.querySelector('.add-to-cart').addEventListener('click', () => {
    const cart = getCart();
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification();
  });
  return card;
}

function showNotification() {
  const note = document.createElement('div');
  note.textContent = 'Added to cart!';
  note.style.position = 'fixed';
  note.style.top = '80px';
  note.style.left = '50%';
  note.style.transform = 'translateX(-50%)';
  note.style.backgroundColor = '#28a745';
  note.style.color = 'white';
  note.style.padding = '0.75rem 1.5rem';
  note.style.borderRadius = '6px';
  note.style.fontWeight = 'bold';
  note.style.zIndex = '1000';
  note.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 1300);
}

function renderResults() {
  const matches = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  summary.textContent = query
    ? `Showing results for "${query}" (${matches.length} found)`
    : 'Showing all products';

  if (matches.length === 0) {
    productList.innerHTML = '<p style="color: var(--gray-color);">No products found.</p>';
    return;
  }

  matches.forEach(product => {
    productList.appendChild(createProductCard(product));
  });
}

updateCartCount();
renderResults();
