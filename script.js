const slides = document.querySelectorAll('.hero-slide');
let current = 0;

function changeSlide() {
  slides[current].classList.remove('active');
  current = (current + 1) % slides.length;
  slides[current].classList.add('active');
}
setInterval(changeSlide, 5000);

const cart = {};
let selectedItem = null;
let selectedPrice = 0;

function showSizeModal(item, price) {
  selectedItem = item;
  selectedPrice = price;
  document.getElementById("modalItemName").textContent = `Select size for: ${item}`;
  document.getElementById("sizeModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("sizeModal").style.display = "none";
  selectedItem = null;
  selectedPrice = 0;
  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
}

function selectSize(size) {
  const itemWithSize = `${selectedItem} - ${size}`;
  let price = selectedPrice;
  if (size === "Medium") price += 20;
  if (size === "Large") price += 40;

  if (!cart[itemWithSize]) {
    cart[itemWithSize] = { quantity: 1, price, original: selectedItem };
  } else {
    cart[itemWithSize].quantity++;
  }

  renderCart();
  saveCartToStorage();
  closeModal();
}

function addToCart(item, price) {
  showSizeModal(item, price);
}

function removeFromCart(item) {
  if (cart[item]) {
    cart[item].quantity--;
    if (cart[item].quantity <= 0) delete cart[item];
  }
  saveCartToStorage();
  renderCart();
}

function toggleCartDropdown() {
  const dropdown = document.getElementById("floatingCartDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const floatingItems = document.getElementById('floating-cart-items');
  const floatingTotal = document.getElementById('floating-cart-total');
  const cartCountBadge = document.getElementById('cart-count-badge');

  if (!cartItems || !floatingItems) return;

  cartItems.innerHTML = '';
  floatingItems.innerHTML = '';

  let total = 0;
  let itemCount = 0;

  for (const item in cart) {
    const { quantity, price, original } = cart[item];
    total += quantity * price;
    itemCount += quantity;
    const baseItem = original || item;

    const itemHTML = `
      <div class="cart-item">
        <span>${item} (x${quantity})</span>
        <div>
          <button onclick="showSizeModal('${baseItem}', ${price})">+</button>
          <button onclick="removeFromCart('${item}')">−</button>
        </div>
      </div>
    `;

    cartItems.innerHTML += itemHTML;
    floatingItems.innerHTML += itemHTML;
  }

  cartTotal.innerText = total;
  floatingTotal.innerText = total;
  cartCountBadge.innerText = itemCount;
  cartCountBadge.style.display = itemCount > 0 ? "flex" : "none";
}

function buyItems() {
  const overlay = document.getElementById("overlay");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const confirmationMessage = document.getElementById("confirmationMessage");

  overlay.style.display = "flex";
  loadingSpinner.style.display = "none";
  confirmationMessage.style.display = "block";

  confirmationMessage.innerHTML = `
    <strong>YOUR ORDERS</strong><br>
    <ul id="confirmationItems" style="list-style: none; padding: 10px 0;"></ul>
    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
      <button onclick="confirmOrder()" style="padding: 6px 12px; background: #fff; color: #000; border: none; cursor: pointer; border-radius: 5px;">Confirm Order</button>
      <button onclick="cancelOrder()" style="padding: 6px 12px; background: #ccc; color: #000; border: none; cursor: pointer; border-radius: 5px;">Cancel</button>
    </div>
  `;

  const confirmationList = confirmationMessage.querySelector("#confirmationItems");
  confirmationList.innerHTML = "";

  for (const item in cart) {
    const { quantity, price } = cart[item];
    confirmationList.innerHTML += `<li><strong>${item}</strong> x${quantity} - ₱${price * quantity}</li>`;
  }
}

function confirmOrder() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  const confirmationMessage = document.getElementById("confirmationMessage");

  confirmationMessage.style.display = "none";
  loadingSpinner.style.display = "block";
  loadingSpinner.innerHTML = "⏳ Preparing your coffee...";

  setTimeout(() => {
    loadingSpinner.innerHTML = "✅ <strong>Order Accepted!</strong>";

    for (const item in cart) {
      delete cart[item];
    }
    renderCart();
    saveCartToStorage();

    setTimeout(() => {
      document.getElementById("overlay").style.display = "none";
    }, 2000);
  }, 2000);
}

function cancelOrder() {
  document.getElementById("overlay").style.display = "none";
}

function showGreeting() {
  const hour = new Date().getHours();
  let greeting = "Good Morning! ☕ Order your coffee now!";
  if (hour >= 12 && hour < 18) greeting = "Good Afternoon! ☀️ Time for coffee!";
  else if (hour >= 18) greeting = "Good Evening! 🌙 Enjoy a cozy cup!";

  const originalText = "KAPE NGA GIKAN SA TAE";
  document.querySelector('.hero-content p').textContent = `${originalText} — ${greeting}`;
}

function filterProducts() {
  const input = document.getElementById("searchBar").value.toLowerCase();
  const cards = document.querySelectorAll(".product-card");

  cards.forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = title.includes(input) ? "block" : "none";
  });
}

function saveCartToStorage() {
  localStorage.setItem('boloCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  const stored = localStorage.getItem('boloCart');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      Object.assign(cart, parsed);
      renderCart();
    } catch (e) {
      console.error("Failed to load cart:", e);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  showGreeting();
});
