document.addEventListener("DOMContentLoaded", function () {
    const filterDropdown = document.getElementById("filter");
    const sortDropdown = document.getElementById("sort");
    const products = document.querySelectorAll(".product");
    const productsGrid = document.querySelector(".products-grid");

    function initializeStock() {
        const suppliesStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        
        products.forEach(product => {
            const productName = product.querySelector("h2").textContent;
            if (!suppliesStock.hasOwnProperty(productName)) {
                suppliesStock[productName] = parseInt(product.getAttribute("data-stock"));
            }
        });
        
        localStorage.setItem("booksStock", JSON.stringify(suppliesStock));
        return suppliesStock;
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
    
            if (sortValue === "az") return titleA.localeCompare(titleB);
            else if (sortValue === "za") return titleB.localeCompare(titleA);
            else if (sortValue === "most-stock") return stockB - stockA;
            else if (sortValue === "least-stock") return stockA - stockB;
        });
    
        productsGrid.innerHTML = "";
        productsArray.forEach((product) => productsGrid.appendChild(product));
        attachCartListeners(); // Reattach listeners after sorting
    }

    function updateStockStatus() {
        const suppliesStock = JSON.parse(localStorage.getItem("booksStock")) || {};

        products.forEach(product => {
            const productName = product.querySelector("h2").textContent;
            const stock = suppliesStock[productName] || 0;
            const stockText = product.querySelector(".stock");
            const stockCount = product.querySelector(".stock-count");
            const button = product.querySelector(".add-to-cart");

            // Update data-stock attribute and display
            product.setAttribute("data-stock", stock);
            stockCount.textContent = stock;

            if (stock <= 0) {
                stockText.classList.add("unavailable");
                stockText.classList.remove("available");
                button.disabled = true;
                button.textContent = "Out of Stock";
                button.classList.add("out-of-stock");

                // Style out-of-stock button
                button.style.backgroundColor = "gray";
                button.style.color = "white";
                button.style.cursor = "not-allowed";
                button.style.opacity = "0.7";
            } else {
                stockText.classList.add("available");
                stockText.classList.remove("unavailable");
                button.disabled = false;
                button.textContent = "Add to Cart";
                button.classList.remove("out-of-stock");

                // Reset button styles
                button.style.backgroundColor = "";
                button.style.color = "";
                button.style.cursor = "";
                button.style.opacity = "";
            }
        });
    }

    function addToCart(name, price, image) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const suppliesStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        
        if (!suppliesStock[name] || suppliesStock[name] <= 0) {
            alert("Sorry, this item is out of stock!");
            return;
        }

        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            if (suppliesStock[name] > existingItem.quantity) {
                existingItem.quantity += 1;
            } else {
                alert("Sorry, not enough stock available!");
                return;
            }
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`${name} has been added to the cart!`);
        updateStockStatus();
    }

    function attachCartListeners() {
        products.forEach(product => {
            const button = product.querySelector(".add-to-cart");
            // Remove existing listeners by cloning and replacing
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new click listener
            newButton.addEventListener("click", () => {
                if (!newButton.disabled) {
                    const productName = product.querySelector("h2").textContent;
                    const productPrice = product.querySelector(".price").textContent;
                    const productImage = product.querySelector("img").src;
                    addToCart(productName, productPrice, productImage);
                }
            });
        });
    }

    // Initialize stock
    initializeStock();
    updateStockStatus();
    attachCartListeners();

    // Event Listeners
    filterDropdown.addEventListener("change", () => {
        filterProducts();
        sortProducts();
    });

    sortDropdown.addEventListener("change", sortProducts);

    // Storage event listener
    window.addEventListener('storage', function(e) {
        if (e.key === 'booksStock') {
            updateStockStatus();
            attachCartListeners();
        }
    });
});