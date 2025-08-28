
// Dynamic menu from backend
let menu = [];
const qty = {};
const cart = {};

function renderMenu() {
  const grid = document.querySelector('.menu-grid');
  grid.innerHTML = '';
    const images = {
      'Burger': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      'French Fries': 'https://th.bing.com/th/id/R.5de4f743b777e1bd8bb5d6b1e702bdff?rik=69c5Fi6Kb%2bucMg&pid=ImgRaw&r=0',
      'Coke': 'https://tse4.mm.bing.net/th/id/OIP.XPeA4yUdGdb5prLG_XlUAwHaE8?r=0&cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3'
    };
    const prices = {
      'Burger': 4.99,
      'Pizza': 7.99,
      'French Fries': 2.49,
      'Coke': 1.49
    };
    menu.forEach(item => {
      qty[item._id] = 1;
      const div = document.createElement('div');
      div.className = 'menu-item';
      const soldOut = item.quantity === 0;
      div.innerHTML = `
        <img src="${images[item.name] || images['Burger']}" alt="${item.name}" style="width:100%;max-width:180px;border-radius:1em;margin-bottom:0.5em;">
        <h3>${item.name}</h3>
        <div style="color:#ff9800;font-weight:bold;margin-bottom:0.5em;font-size:1.2em;">$${prices[item.name] ? prices[item.name].toFixed(2) : 'N/A'}</div>
        <p>Available: <b>${item.quantity}</b> ${soldOut ? '<span style=\"color:red;font-weight:bold;\">(Sold Out)</span>' : ''}</p>
        <div class="qty-controls">
          <button class="qty-btn minus" onclick="changeQty('${item._id}', -1)" ${soldOut ? 'disabled' : ''}>-</button>
          <span class="qty-value" id="qty-${item._id}">1</span>
          <button class="qty-btn plus" onclick="changeQty('${item._id}', 1)" ${soldOut ? 'disabled' : ''}>+</button>
        </div>
        <div class="action-btns">
          <button onclick="addToCart('${item._id}')" ${soldOut ? 'disabled style="background:#ccc;color:#888;cursor:not-allowed;"' : ''}>${soldOut ? 'Sold Out' : 'Add to Cart'}</button>
        </div>
      `;
      grid.appendChild(div);
    });
}

function changeQty(id, delta) {
  qty[id] += delta;
  if (qty[id] < 1) qty[id] = 1;
  document.getElementById('qty-' + id).textContent = qty[id];
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + qty[id];
  updateCartCount();
  const item = menu.find(m => m._id === id);
  alert(`Added ${qty[id]} ${item.name}${qty[id] > 1 ? 's' : ''} to cart!`);
}

function updateCartCount() {
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  document.getElementById('cart-count').textContent = count;
}

function renderCartItems() {
  const itemsDiv = document.getElementById('cart-items');
  const totalDiv = document.getElementById('cart-total');
  const prices = {
    'Burger': 4.99,
    'Pizza': 7.99,
    'French Fries': 2.49,
    'Coke': 1.49
  };
  let total = 0;
  if (Object.keys(cart).length === 0) {
    itemsDiv.innerHTML = '<em>Your cart is empty!</em>';
    totalDiv.textContent = '';
  } else {
    let msg = '';
    for (const [id, count] of Object.entries(cart)) {
      const item = menu.find(m => m._id === id);
      let price = prices[item.name] || 0;
      let itemTotal = price * count;
      total += itemTotal;
      msg += `<div style="margin-bottom:0.5em;display:flex;justify-content:space-between;align-items:center;">
        <span>${item.name} 
          <button onclick="cartChangeQty('${id}', -1)" style="margin:0 0.5em;background:#43a047;color:#fff;border:none;border-radius:50%;width:1.8em;height:1.8em;font-size:1.1em;cursor:pointer;">-</button>
          <b>${count}</b>
          <button onclick="cartChangeQty('${id}', 1)" style="margin:0 0.5em;background:#e53935;color:#fff;border:none;border-radius:50%;width:1.8em;height:1.8em;font-size:1.1em;cursor:pointer;">+</button>
        </span>
        <span>$${itemTotal.toFixed(2)}</span>
      </div>`;
    }
    itemsDiv.innerHTML = msg;
    totalDiv.textContent = `Total: $${total.toFixed(2)}`;
  }
}

function cartChangeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] < 1) {
    delete cart[id];
  }
  updateCartCount();
  renderCartItems();
}

function viewCart() {
  renderCartItems();
  document.getElementById('cart-modal').style.display = 'flex';
}

function closeCartModal() {
  document.getElementById('cart-modal').style.display = 'none';
}
function checkoutCart() {
  // Remove food items from database
  const cartCopy = { ...cart };
  const ids = Object.keys(cartCopy);
  Promise.all(ids.map(id =>
    fetch(`http://localhost:3000/foods/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: cartCopy[id] })
    })
  ))
  .then(() => {
    alert('Payment successful!');
    closeCartModal();
    fetch('http://localhost:3000/foods')
      .then(res => res.json())
      .then(data => {
        menu = data;
        renderMenu();
      });
    // Log the purchase after successful checkout
    const logItems = ids.map(id => ({
      name: menu.find(item => item._id === id).name,
      quantity: cartCopy[id],
      price: menu.find(item => item._id === id).price
    }));
    const total = logItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    fetch('http://localhost:3001/foods/log-purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items: logItems, total })
    });
    // Clear the cart after all actions
    for (const id of ids) delete cart[id];
    updateCartCount();
    renderCartItems();
  });
}
function payAtCounter() {
  // Remove food items from database
  const cartCopy = { ...cart };
  const ids = Object.keys(cartCopy);
  Promise.all(ids.map(id =>
    fetch(`http://localhost:3000/foods/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: cartCopy[id] })
    })
  ))
  .then(() => {
    alert('Payment successful!');
    closeCartModal();
    fetch('http://localhost:3000/foods')
      .then(res => res.json())
      .then(data => {
        menu = data;
        renderMenu();
      });
    // Clear the cart after all actions
    for (const id of ids) delete cart[id];
    updateCartCount();
    renderCartItems();
  });
}

// Fetch menu from backend and render
fetch('http://localhost:3000/foods')
  .then(res => res.json())
  .then(data => {
    menu = data;
    renderMenu();
  });
