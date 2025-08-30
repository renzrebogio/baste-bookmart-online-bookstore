document.addEventListener("DOMContentLoaded", function () {
    // Check if we need to refresh the page after checkout
    if (localStorage.getItem("needsStockRefresh") === "true") {
        localStorage.removeItem("needsStockRefresh");
        location.reload(); // Force a complete page reload
    }
    const filterDropdown = document.getElementById("filter");
    const sortDropdown = document.getElementById("sort");
    const products = document.querySelectorAll(".product");
    const productsContainer = document.querySelector(".products-grid"); // Make sure this matches your container class
    
    // Filter products based on category
    function filterProducts() {
        const filterValue = filterDropdown.value;
        
        products.forEach(product => {
            const category = product.getAttribute("data-category");
            
            if (filterValue === "all" || category === filterValue) {
                product.style.display = "block";
            } else {
                product.style.display = "none";
            }
        });
    }
    
    // Sort products based on selected criteria
    function sortProducts() {
        const sortValue = sortDropdown.value;
        const productsArray = Array.from(products).filter(product => 
            product.style.display !== "none"
        );
        
        productsArray.sort((a, b) => {
            const titleA = a.querySelector("h2").textContent.toLowerCase();
            const titleB = b.querySelector("h2").textContent.toLowerCase();
            const stockA = parseInt(a.getAttribute("data-stock"));
            const stockB = parseInt(b.getAttribute("data-stock"));
            
            if (sortValue === "a-z") return titleA.localeCompare(titleB);
            else if (sortValue === "z-a") return titleB.localeCompare(titleA);
            else if (sortValue === "most-stock") return stockB - stockA;
            else if (sortValue === "least-stock") return stockA - stockB;
            return 0;
        });
        
        // Clear and re-append sorted products
        productsArray.forEach(product => {
            productsContainer.appendChild(product);
        });
    }
    
    // Apply both filter and sort
    function applyFilterAndSort() {
        filterProducts();
        sortProducts();
    }
    
    // Initialize stock in localStorage if not exists
    function initializeStock() {
        const booksStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        
        products.forEach(product => {
            const productName = product.querySelector("h2").textContent;
            const sizeDropdown = product.querySelector(".size-dropdown");
            
            if (sizeDropdown) {
                // Initialize stock for each size option
                Array.from(sizeDropdown.options).forEach(option => {
                    const stockKey = `${productName}-${option.value}`;
                    if (!booksStock.hasOwnProperty(stockKey)) {
                        // Set default stock per size
                        booksStock[stockKey] = parseInt(product.getAttribute("data-stock"));
                    }
                });
            } else {
                // Initialize stock for products without size
                if (!booksStock.hasOwnProperty(productName)) {
                    booksStock[productName] = parseInt(product.getAttribute("data-stock"));
                }
            }
        });
        
        localStorage.setItem("booksStock", JSON.stringify(booksStock));
        return booksStock;
    }
    
    function updateStockStatus() {
        const booksStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        
        products.forEach(product => {
            const productName = product.querySelector("h2").textContent;
            const sizeDropdown = product.querySelector(".size-dropdown");
            const stockText = product.querySelector(".stock");
            const stockCount = product.querySelector(".stock-count");
            let button = product.querySelector(".add-to-cart");
            
            // Get stock based on current selected size if applicable
            let currentStock = 0;
            if (sizeDropdown) {
                const selectedSize = sizeDropdown.value;
                const stockKey = `${productName}-${selectedSize}`;
                currentStock = booksStock[stockKey] || 0;
                
                // Update stock display when size changes
                sizeDropdown.addEventListener('change', function() {
                    const newSize = this.value;
                    const newStockKey = `${productName}-${newSize}`;
                    const newStock = booksStock[newStockKey] || 0;
                    
                    // Update stock display
                    stockCount.textContent = newStock;
                    
                    // Update availability visual indicators
                    if (newStock <= 0) {
                        stockText.classList.add("unavailable");
                        stockText.classList.remove("available");
                        button.disabled = true;
                        button.textContent = "Out of Stock";
                        button.classList.add("out-of-stock");
                        
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
                        
                        button.style.backgroundColor = "";
                        button.style.color = "";
                        button.style.cursor = "";
                        button.style.opacity = "";
                    }
                });
            } else {
                currentStock = booksStock[productName] || 0;
            }
            
            // Update data-stock attribute and display
            product.setAttribute("data-stock", currentStock);
            stockCount.textContent = currentStock;
            
            if (currentStock <= 0) {
                stockText.classList.add("unavailable");
                stockText.classList.remove("available");
                button.disabled = true;
                button.textContent = "Out of Stock";
                button.classList.add("out-of-stock");
                
                button.style.backgroundColor = "gray";
                button.style.color = "white";
                button.style.cursor = "not-allowed";
                button.style.opacity = "0.7";
                
                button.addEventListener("mouseenter", function () {
                    button.style.backgroundColor = "#555";
                });
                
                button.addEventListener("mouseleave", function () {
                    button.style.backgroundColor = "gray";
                });
            } else {
                stockText.classList.add("available");
                stockText.classList.remove("unavailable");
                button.disabled = false;
                button.textContent = "Add to Cart";
                button.classList.remove("out-of-stock");
                
                button.style.backgroundColor = "";
                button.style.color = "";
                button.style.cursor = "";
                button.style.opacity = "";
                
                const newButton = button.cloneNode(true);
                button.replaceWith(newButton);
                button = newButton;
                
                button.addEventListener("click", () => {
                    const productName = product.querySelector("h2").textContent;
                    const productPrice = product.querySelector(".price").textContent;
                    const productImage = product.querySelector("img").src;
                    const selectedSize = sizeDropdown ? sizeDropdown.value : null;
                    
                    // Check if stock is available with the correct key
                    const stockKey = selectedSize ? `${productName}-${selectedSize}` : productName;
                    if (checkStock(stockKey)) {
                        addToCart(productName, productPrice, productImage, selectedSize);
                    } else {
                        alert("Sorry, this item is out of stock!");
                    }
                });
            }
        });
    }
    
    function checkStock(stockKey) {
        const booksStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        return booksStock[stockKey] && booksStock[stockKey] > 0;
    }
    
    function addToCart(name, price, image, size) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        
        // Find item with the same product name AND size
        const existingItem = cart.find(item => {
            if (size) {
                return item.name === name && item.size === size;
            } else {
                return item.name === name && !item.size;
            }
        });
        
        // Check stock availability with correct key format
        const booksStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        const stockKey = size ? `${name}-${size}` : name;
        
        // Check if we have enough stock for this specific item and size
        if (!booksStock[stockKey] || booksStock[stockKey] <= 0) {
            alert(`Sorry, ${name} ${size ? `(${size})` : ''} is out of stock!`);
            return;
        }
        
        // Check if adding one more would exceed available stock
        const currentItemQuantity = existingItem ? existingItem.quantity : 0;
        if (booksStock[stockKey] <= currentItemQuantity) {
            alert(`Sorry, not enough ${name} ${size ? `(${size})` : ''} available!`);
            return;
        }
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Include size in the cart item
            const newItem = { name, price, image, quantity: 1 };
            if (size) {
                newItem.size = size;
            }
            cart.push(newItem);
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        
        // Show size in the alert if it exists
        const sizeInfo = size ? ` (Size: ${size})` : '';
        alert(`${name}${sizeInfo} has been added to the cart!`);
    }
    
    // Event listeners
    filterDropdown.addEventListener("change", applyFilterAndSort);
    sortDropdown.addEventListener("change", applyFilterAndSort);
    
    // Listen for storage events to update stock display when cart.js makes changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'booksStock') {
            updateStockStatus();
        }
    });
    
    // Initialize stock when page loads
    initializeStock();
    updateStockStatus();
    
    // Apply initial filter and sort
    applyFilterAndSort();
    
    // Handle size dropdowns if present
    const sizeDropdowns = document.querySelectorAll('.size-dropdown');
    
    sizeDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', function () {
            const product = this.closest('.product');
            const basePrice = parseFloat(product.getAttribute('data-base-price'));
            const priceElement = product.querySelector('.price');
            const sizeDisplay = product.querySelector('.size-display');
            
            // Update the displayed size
            if (sizeDisplay) {
                sizeDisplay.textContent = this.value;
            }
            
            let additionalPrice = 0;
            switch (this.value) {
                case 'S': additionalPrice = 20; break;
                case 'M': additionalPrice = 40; break;
                case 'L': additionalPrice = 60; break;
                case 'XL': additionalPrice = 80; break;
                case 'XLL': additionalPrice = 100; break;
                default: additionalPrice = 0;
            }
            
            const newPrice = basePrice + additionalPrice;
            priceElement.textContent = `₱${newPrice}`;
        });
    });
    
    // Initialize the size display labels
    document.querySelectorAll('.size-dropdown').forEach(dropdown => {
        const product = dropdown.closest('.product');
        const sizeDisplay = product.querySelector('.size-display');
        if (sizeDisplay) {
            sizeDisplay.textContent = dropdown.value;
        }
    });
    
    // Add a function for checkout that will be called from your checkout page
    window.checkoutCart = function() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const booksStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        
        // Reduce stock based on cart items
        cart.forEach(item => {
            const stockKey = item.size ? `${item.name}-${item.size}` : item.name;
            if (booksStock[stockKey]) {
                booksStock[stockKey] -= item.quantity;
                // Ensure stock doesn't go below 0
                if (booksStock[stockKey] < 0) {
                    booksStock[stockKey] = 0;
                }
            }
        });
        
        // Update stock in localStorage
        localStorage.setItem("booksStock", JSON.stringify(booksStock));
        
        // Clear the cart
        localStorage.setItem("cart", JSON.stringify([]));
        
        // Update the display
        updateStockStatus();
        
        alert("Checkout complete! Thank you for your purchase.");
    };
});