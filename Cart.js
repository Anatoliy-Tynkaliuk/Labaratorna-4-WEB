

let cartItems = [];

function addToCart(postId) {
    const post = posts.find(item => item.id === postId);
    if (post) {
        const existingCartItem = cartItems.find(item => item.id === postId);
        if (existingCartItem) {
            existingCartItem.quantity += 1; 
        } else {
            post.quantity = 1; 
            cartItems.push(post);
        }
        updateCart();
    } 
}

function increaseQuantity(postId) {
    const cartItem = cartItems.find(item => item.id === postId);
    if (cartItem) {
        cartItem.quantity += 1; 
        updateCart(); 
    }
}

function decreaseQuantity(postId) {
    const cartItem = cartItems.find(item => item.id === postId);
    if (cartItem && cartItem.quantity > 1) {
        cartItem.quantity -= 1; 
        updateCart(); 
    }
}
function clearCart() {
    cartItems = []; 
    updateCart(); 
}
function updateCart() {
    const cartContent = document.getElementById('cartContent');
    const totalPriceElement = document.getElementById('totalPrice');
    let totalPrice = 0;

    cartContent.innerHTML = '';

    cartItems.forEach(function(item) {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
        <div class="cart-item-content">
            <img src="${item.image}" alt="${item.title}" height = "200px" width = "225px">
            <div class="cart-item-details">
                <h2>${item.title}</h2>
                <h3>${item.price} x ${item.quantity}</h3>
                <button onclick="increaseQuantity(${item.id})" class="cors-button">+</button>
                <button onclick="decreaseQuantity(${item.id})"  class="cors-button" >-</button>
            </div>
            </div>
        `;
        cartContent.appendChild(cartItem);

        totalPrice += parseInt(item.price) * item.quantity;
    });

    totalPriceElement.textContent = `Total: ${totalPrice} грн.`;
}

function openCartModal() {
    updateCart(); 
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'block';
}

function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'none';
}



function showOrders(orders) {
    const container = document.getElementById("ordersContainer");
    container.innerHTML = "";
  
    if (orders.length === 0) {
      container.textContent = "У вас ще немає замовлень.";
      return;
    }
  
    orders.forEach(order => {
      const orderBlock = document.createElement("div");
      orderBlock.className = "order-block";
      orderBlock.innerHTML = `
        <h3>Замовлення №${order.order_id}</h3>
        <p>Дата: ${new Date(order.date).toLocaleString()}</p>
        <p>Загальна сума: ${order.total} грн.</p>
        <ul>
          ${order.items.map(item => `
            <li>
              <strong>${item.title}</strong> — ${item.price} грн. x ${item.quantity} шт.
              ${item.manufacturer ? `<br>Країна виробник: ${item.manufacturer}` : ""}
              ${item.description ? `<br>Опис: ${item.description}` : ""}
            </li>
          `).join("")}
        </ul>
        <div>
        <button type="button" class="cancel-oreder-btn">Приховати замовлення</button>
      </div>
      `;
      orderBlock.querySelector(".cancel-oreder-btn").onclick = () => orderBlock.remove();
      container.appendChild(orderBlock);
    });
  }
  



