let posts = [];

document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("cardsContainer");
    const sortSelect = document.getElementById("sort-by-name");
    const priceRange = document.getElementById("price-range");
    const priceRangeValue = document.getElementById("price-range-value");
    const searchInput = document.getElementById("search");
    const filterButtons = document.querySelectorAll('.navig button');

    // Завантаження даних
    function fetchPosts() {
        return fetch('http://localhost:5000/products')
            .then(response => response.json())
            .then(data => {
                posts = data;
                loadPosts("Всі товари");
            })
            .catch(err => {
                console.error('Помилка при завантаженні posts.json:', err);
                container.innerHTML = '<p>Не вдалося завантажити товари.</p>';
            });
    }

    // Функція сортування (окремо)
    function sortPosts(items, sortBy) {
        if (sortBy === "name-asc") {
            return items.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "name-desc") {
            return items.sort((a, b) => b.title.localeCompare(a.title));
        } else if (sortBy === "price-asc") {
            return items.sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
        } else if (sortBy === "price-desc") {
            return items.sort((a, b) => parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')));
        }
        return items;
    }

    // Відображення постів із фільтром, пошуком і сортуванням
    function loadPosts(category = "Всі товари") {
        if (category === "Корзина") {
            category = "Всі товари"; 
        }

        let filteredPosts = posts.filter(post => {
            const maxPrice = parseInt(priceRange.value);
            const postPrice = parseInt(post.price.replace(/\D/g, ''));

            if (postPrice > maxPrice) return false;

            const searchTerm = searchInput.value.toLowerCase();
            if (
                !post.title.toLowerCase().includes(searchTerm) &&
                !post.description.toLowerCase().includes(searchTerm) &&
                !post.category.toLowerCase().includes(searchTerm)
            ) {
                return false;
            }

            return category === "Всі товари" || post.category === category;
        });

        priceRangeValue.textContent = `0 - ${priceRange.value} грн`;

        const sortedPosts = sortPosts(filteredPosts, sortSelect.value);

        let postsHtml = '';
        sortedPosts.forEach(function(post, index) {
            postsHtml += `<div class="image-card">
                <div class="image_and_text-container">
                    <img class="image" src="${post.image}" alt="${post.title}">
                    <div class="discount">${post.discounts}</div>
                    <p class="name">${post.title}</p>
                    <h2>${post.price}</h2>
                    <button class="toggle-description" data-index="${index}">Показати опис</button>
                    <p class="description hidden">${post.description}</p>
                    <button class="butt-corsina" onclick="addToCart(${post.id})">Додати в корзину</button>
            `;

            if (currentUser && currentUser.role === "admin") {
                postsHtml += `
                    <button class="admin-button" onclick="editProduct(${post.id})">Редагувати</button>
                    <button class="admin-button" onclick="deleteProduct(${post.id})">Видалити</button>
                `;
            }

            postsHtml += `</div></div>`;
        });

        container.innerHTML = postsHtml;

        // Обробка показу/приховування опису
        document.querySelectorAll('.toggle-description').forEach(button => {
            button.addEventListener('click', function() {
                let descript = this.nextElementSibling;
                descript.classList.toggle('hidden');
                this.textContent = descript.classList.contains('hidden') ? "Показати опис" : "Приховати опис";
            });
        });
    }

    // Обробники подій для фільтрів і сортування
    sortSelect.addEventListener("change", () => loadPosts(getCurrentCategory()));
    priceRange.addEventListener("input", () => loadPosts(getCurrentCategory()));
    searchInput.addEventListener("input", () => loadPosts(getCurrentCategory()));

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            loadPosts(this.textContent);
        });
    });

    // Визначаємо поточну категорію (за потреби)
    function getCurrentCategory() {
        // Можна тут додати логіку визначення категорії,
        // або зберігати вибір користувача глобально
        // Для простоти — повернемо "Всі товари"
        return "Всі товари";
    }

    // Початкове завантаження
    fetchPosts();
    window.fetchPosts = fetchPosts;
});



// Твої функції addToCart, editProduct, deleteProduct залишаються без змін
