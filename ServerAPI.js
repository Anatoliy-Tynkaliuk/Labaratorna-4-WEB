const API = "http://localhost:5000";
let currentUser = null; 


//Оформлення замовлення
async function checkoutCart() {
  if (!currentUser) {
    alert("Спочатку увійдіть у систему");
    return;
  }
  if (cartItems.length === 0) {
    alert("Кошик порожній!");
    return;
  }
  const total = cartItems.reduce((sum, item) => {
    const priceNum = typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return sum + priceNum * item.quantity;
  }, 0);
  
  try {
    const r = await fetch(`${API}/cart`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_email: currentUser.email,
        items: cartItems.map(i => ({
          id: i.id, title: i.title, price: i.price, quantity: i.quantity
        })),
        total
      })
    });
    const ans = await r.json();
    if (r.ok) {
      alert(`Замовлення №${ans.order_id} прийнято`);
      clearCart();
      closeCartModal();
    } else {
      alert("Помилка: " + ans.msg);
    }
  } catch (e) { console.error(e); }
}


//Кнопка для оформлення
(function addCheckoutButton () {
  const btn = document.createElement("button");
  btn.textContent = "Оформити замовлення";
  btn.className = "close";
  btn.style.cursor = "pointer";
  btn.onclick = checkoutCart;
  document.querySelector(".corsina-content").appendChild(btn);
})();


document.getElementById("myOrdersBtn").addEventListener("click", loadMyOrders);

async function loadMyOrders() {
  if (!currentUser) {
    alert("Спочатку увійдіть у систему");
    return;
  }

  try {
    const r = await fetch(`${API}/my-orders?email=${currentUser.email}`);
    const orders = await r.json();

    if (r.ok) {
      showOrders(orders);
    } else {
      alert("Помилка: " + orders.msg);
    }
  } catch (e) {
    console.error("Помилка при завантаженні замовлень:", e);
  }
}

function showAdminControls() {
  const adminPanel = document.getElementById("adminPanel");
  if (adminPanel) adminPanel.style.display = "block";

  const adminStatus = document.getElementById("adminStatus");
  if (adminStatus) {
    adminStatus.textContent = "Адміністратор";
  }
}

  //Видалити товар
  async function deleteProduct(id) {
    const confirmed = confirm("Ви точно хочете видалити цей товар?");
    if (!confirmed) return;
  
    const r = await fetch(`${API}/products/${id}`, {
      method: "DELETE",
      headers: {
        "X-Role": currentUser.role
      }
    });
  
    const ans = await r.text();
    if (r.ok) {
      alert("Товар видалено");
      fetchPosts() 


    } else {
      alert("Помилка: " + ans);
    }
  }
  

  //Редагувати дані товара
  function editProduct(id) {
    const product = posts.find(p => p.id === id);
    if (!product) {
      alert("Товар не знайдено");
      return;
    }
  
    const existingForm = document.getElementById(`edit-form-${id}`);
    if (existingForm) return; 
  
    const form = document.createElement("form");
    form.className = "edit-form";
    form.id = `edit-form-${id}`;
    form.innerHTML = `
      <h3>Редагування товару (ID: ${product.id})</h3>
      <input id="editTitle-${id}" value="${product.title}" placeholder="Нова назва">
      <input id="editPrice-${id}" value="${parseInt(product.price)}" type="number" min="0" placeholder="Нова ціна">
      <div>
        <button type="submit">Зберегти</button>
        <button type="button" class="cancel-btn">Скасувати</button>
      </div>
    `;
  
    form.onsubmit = async (e) => {
      e.preventDefault();
  
      const newTitle = document.getElementById(`editTitle-${id}`).value.trim();
      const newPriceNum = Number(document.getElementById(`editPrice-${id}`).value);
  
      if (!newTitle || isNaN(newPriceNum) || newPriceNum < 0) {
        alert("Перевірте правильність введених даних");
        return;
      }
  
      const updated = {
        ...product,
        title: newTitle,
        price: `${newPriceNum} грн.`
      };
  
      const orderedKeys = ["id", "discounts", "title", "description", "price", "image", "category"];
      const jsonString = JSON.stringify(updated, orderedKeys);
  
      const r = await fetch(`${API}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Role": currentUser.role
        },
        body: jsonString
      });
  
      const ans = await r.json();
  
      if (r.ok) {
        alert("Товар оновлено");
        form.remove();
        fetchPosts() 

      } else {
        alert("Помилка: " + ans.msg);
      }
    };
  
    form.querySelector(".cancel-btn").onclick = () => form.remove();
  
    document.getElementById("edit-forms-container").appendChild(form);
  }
  



  