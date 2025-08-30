// books.js
document.addEventListener("DOMContentLoaded", function () {
    const filterDropdown = document.getElementById("filter");
    const sortDropdown = document.getElementById("sort");
    const products = document.querySelectorAll(".product");
    const productsGrid = document.querySelector(".products-grid");

    // Load initial stock data if not exists
    if (!localStorage.getItem("booksStock")) {
        const initialStock = {};
        products.forEach(product => {
            const productName = product.querySelector("h2").textContent;
            const stock = parseInt(product.getAttribute("data-stock"));
            initialStock[productName] = stock;
        });
        localStorage.setItem("booksStock", JSON.stringify(initialStock));
    }

    // Update products with current stock levels
    function updateProductsFromStorage() {
        const currentStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        products.forEach(product => {
            const productName = product.querySelector("h2").textContent;
            if (currentStock.hasOwnProperty(productName)) {
                product.setAttribute("data-stock", currentStock[productName]);
            }
        });
        updateStockStatus();
    }

    function filterProducts() {
        const filterValue = filterDropdown.value;
        products.forEach((product) => {
            const category = product.getAttribute("data-category");
            if (filterValue === "all" || category === filterValue) {
                product.style.display = "block";
            } else {
                product.style.display = "none";
            }
        });
    }

    function sortProducts() {
        const sortValue = sortDropdown.value;
        const productsArray = Array.from(products);

        productsArray.sort((a, b) => {
            const titleA = a.querySelector("h2").textContent.toLowerCase();
            const titleB = b.querySelector("h2").textContent.toLowerCase();
            const stockA = parseInt(a.getAttribute("data-stock"));
            const stockB = parseInt(b.getAttribute("data-stock"));

            if (sortValue === "a-z") return titleA.localeCompare(titleB);
            else if (sortValue === "z-a") return titleB.localeCompare(titleA);
            else if (sortValue === "most-stock") return stockB - stockA;
            else if (sortValue === "least-stock") return stockA - stockB;
        });

        productsGrid.innerHTML = "";
        productsArray.forEach((product) => productsGrid.appendChild(product));
    }

    function updateStockStatus() {
        const currentStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        
        products.forEach((product) => {
            const productName = product.querySelector("h2").textContent;
            const stock = currentStock[productName] || 0;
            const stockText = product.querySelector(".stock");
            const stockCount = product.querySelector(".stock-count");
            const button = product.querySelector(".add-to-cart");

            stockCount.textContent = stock;
            product.setAttribute("data-stock", stock);

            if (stock <= 0) {
                stockText.classList.add("unavailable");
                stockText.classList.remove("available");
                button.disabled = true;
                button.textContent = "Out of Stock";
                button.classList.add("out-of-stock");
                button.style.backgroundColor = "gray";
                button.style.cursor = "not-allowed";
                button.style.opacity = "0.7";
            } else {
                stockText.classList.add("available");
                stockText.classList.remove("unavailable");
                button.disabled = false;
                button.textContent = "Add to Cart";
                button.classList.remove("out-of-stock");
                button.style.backgroundColor = "";
                button.style.cursor = "";
                button.style.opacity = "";
            }
        });
    }

    function addToCart(product, name, price, image) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const currentStock = JSON.parse(localStorage.getItem("booksStock"));

        if (currentStock[name] > 0) {
            const existingItem = cart.find((item) => item.name === name);
            
            if (existingItem) {
                if (currentStock[name] >= existingItem.quantity + 1) {
                    existingItem.quantity += 1;
                } else {
                    alert("Not enough stock available!");
                    return;
                }
            } else {
                cart.push({ name, price, image, quantity: 1 });
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            alert(`${name} has been added to the cart!`);
        }
    }

    // Event Listeners
    filterDropdown.addEventListener("change", () => {
        filterProducts();
        sortProducts();
    });

    sortDropdown.addEventListener("change", sortProducts);

    products.forEach((product) => {
        const button = product.querySelector(".add-to-cart");
        button.addEventListener("click", () => {
            const productName = product.querySelector("h2").textContent;
            const productPrice = product.querySelector("p").textContent;
            const productImage = product.querySelector("img").src;
            addToCart(product, productName, productPrice, productImage);
            updateStockStatus();
        });
    });

    // Initialize the page
    updateProductsFromStorage();
});