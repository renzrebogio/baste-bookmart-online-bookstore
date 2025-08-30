document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const clearCartButton = document.getElementById("clear-cart");
    const checkoutButton = document.getElementById("checkout-btn");
    const checkoutModal = document.getElementById("checkout-modal");
    const receiptModal = document.getElementById("receipt-modal");
    const confirmOrderButton = document.getElementById("confirm-order");
    const cancelCheckoutButton = document.getElementById("cancel-checkout");
    const closeReceiptButton = document.getElementById("close-receipt");
    
    // Add reference to payment method radio buttons and payment options container
    const paymentMethodRadios = document.querySelectorAll('input[name="payment"]');
    const onlinePaymentOptions = document.getElementById("online-payment-options");
    
    // QR code modal elements
    const qrModal = document.getElementById("qr-modal");
    const qrContainer = document.getElementById("qr-container");
    const qrTitle = document.getElementById("qr-title");
    const closeQrButton = document.querySelector(".close-qr");

    // Find this function in your second file (cart.js)
function updateStock(cartItems) {
    const currentStock = JSON.parse(localStorage.getItem("booksStock")) || {};
    
    // Subtract quantities from stock
    cartItems.forEach(item => {
        const stockKey = item.size ? `${item.name}-${item.size}` : item.name;
        
        console.log(`Reducing stock for: ${stockKey}`); // Debug log
        console.log(`Before: ${currentStock[stockKey]}`); // Debug log
        
        if (currentStock.hasOwnProperty(stockKey)) {
            currentStock[stockKey] -= item.quantity;
            // Ensure stock doesn't go below 0
            if (currentStock[stockKey] < 0) currentStock[stockKey] = 0;
            
            console.log(`After: ${currentStock[stockKey]}`); // Debug log
        } else {
            console.log(`Stock key not found: ${stockKey}`); // Debug log
            
            // Try to find the key with case-insensitive search
            const possibleKeys = Object.keys(currentStock);
            for (const key of possibleKeys) {
                console.log(`Checking key: ${key}`); // Debug log
            }
        }
    });

    // Save updated stock back to localStorage
    localStorage.setItem("booksStock", JSON.stringify(currentStock));
    
    // Set flag to ensure products page refreshes stock display
    localStorage.setItem("needsStockRefresh", "true");
}

// Also verify the addToCart function in your first file correctly captures the size
// This should be in your first file (products.js)
function addToCart(name, price, image, size) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Debug log to confirm size is being captured correctly
    console.log(`Adding to cart: ${name}, Size: ${size}`);
    
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
    
    console.log(`Checking stock for key: ${stockKey}`); // Debug log
    console.log(`Current stock: ${booksStock[stockKey]}`); // Debug log
    
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

    function verifyStock(cart) {
        const currentStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        const insufficientItems = cart.filter(item => {
            const stockKey = item.size ? `${item.name}-${item.size}` : item.name;
            return !currentStock.hasOwnProperty(stockKey) || currentStock[stockKey] < item.quantity;
        });

        if (insufficientItems.length > 0) {
            const itemsList = insufficientItems.map(item => 
                item.size ? `${item.name} (${item.size})` : item.name
            ).join(", ");
            alert(`Insufficient stock for: ${itemsList}. Please adjust your cart.`);
            return false;
        }
        return true;
    }

    function loadCart() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cartItemsContainer.innerHTML = "";

        let total = 0;

        cart.forEach((item, index) => {
            let itemTotal = parseFloat(item.price.replace("₱", "")) * item.quantity;
            total += itemTotal;

            const row = document.createElement("tr");
            
            // Include size in the display if it exists
            const displayName = item.size ? `${item.name} (${item.size})` : item.name;
            
            row.innerHTML = `
                <td><img src="${item.image}" alt="${displayName}" width="50"></td>
                <td>${displayName}</td>
                <td>${item.price}</td>
                <td>
                    <button class="decrease" data-index="${index}">-</button>
                    ${item.quantity}
                    <button class="increase" data-index="${index}">+</button>
                </td>
                <td>₱${itemTotal.toFixed(2)}</td>
                <td><button class="remove-item" data-index="${index}">Remove</button></td>
            `;

            cartItemsContainer.appendChild(row);
        });

        cartTotal.textContent = `Total: ₱${total.toFixed(2)}`;

        // Add event listeners for quantity buttons
        document.querySelectorAll(".increase, .decrease, .remove-item").forEach(button => {
            button.addEventListener("click", handleCartAction);
        });
    }

    function handleCartAction(event) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let index = event.target.getAttribute("data-index");
        const currentStock = JSON.parse(localStorage.getItem("booksStock")) || {};

        if (event.target.classList.contains("increase")) {
            const item = cart[index];
            // Check if increasing quantity is possible
            const stockKey = item.size ? `${item.name}-${item.size}` : item.name;
            if (currentStock[stockKey] > item.quantity) {
                cart[index].quantity += 1;
            } else {
                alert("Cannot add more of this item - insufficient stock!");
                return;
            }
        } else if (event.target.classList.contains("decrease")) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
        } else if (event.target.classList.contains("remove-item")) {
            cart.splice(index, 1);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
    }

    // This function should be called when adding an item to cart
    // Exported so it can be used in other js files
    window.addToCart = function(item) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        
        // Create a unique identifier for the item that includes the size
        const existingItemIndex = cart.findIndex(cartItem => 
            cartItem.name === item.name && 
            cartItem.size === item.size // Compare sizes too
        );
        
        // Check stock availability
        const currentStock = JSON.parse(localStorage.getItem("booksStock")) || {};
        const stockKey = item.size ? `${item.name}-${item.size}` : item.name;
        
        if (!currentStock[stockKey] || currentStock[stockKey] <= 0) {
            alert(`${item.name} ${item.size ? `(${item.size})` : ''} is out of stock!`);
            return;
        }
        
        // Check if adding more would exceed stock
        const currentQuantity = existingItemIndex !== -1 ? cart[existingItemIndex].quantity : 0;
        if (currentStock[stockKey] <= currentQuantity) {
            alert(`Cannot add more ${item.name} ${item.size ? `(${item.size})` : ''} - insufficient stock!`);
            return;
        }
        
        if (existingItemIndex !== -1) {
            // If the exact same item with same size exists, increase quantity
            cart[existingItemIndex].quantity += item.quantity || 1;
        } else {
            // Otherwise add as a new item
            cart.push({
                ...item,
                quantity: item.quantity || 1
            });
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`${item.name} ${item.size ? `(${item.size})` : ''} added to cart!`);
    }

    function generateTransactionNumber() {
        return 'BB' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
    }

    function showCheckoutSummary() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Verify stock before showing checkout
        if (!verifyStock(cart)) {
            return;
        }

        const orderSummary = document.getElementById("order-summary");
        let summaryHTML = "<h3>Items:</h3><ul>";
        let total = 0;

        cart.forEach(item => {
            const itemTotal = parseFloat(item.price.replace("₱", "")) * item.quantity;
            total += itemTotal;
            // Include size in the display if it exists
            const displayName = item.size ? `${item.name} (${item.size})` : item.name;
            summaryHTML += `<li>${displayName} x ${item.quantity} - ₱${itemTotal.toFixed(2)}</li>`;
        });

        summaryHTML += `</ul><h3>Total Amount: ₱${total.toFixed(2)}</h3>`;
        orderSummary.innerHTML = summaryHTML;
        checkoutModal.style.display = "block";
        
        // Set initial state of payment options based on default selection
        togglePaymentOptions();
    }

    function generateReceipt() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        
        // Final stock verification before generating receipt
        if (!verifyStock(cart)) {
            checkoutModal.style.display = "none";
            return;
        }
    
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const transactionNumber = generateTransactionNumber();
        const date = new Date().toLocaleString();
        let total = 0;
    
        let receiptHTML = `
            <div class="receipt-header">
                <h3>BASTE BOOKMART</h3>
                <p>Transaction #: ${transactionNumber}</p>
                <p>Date: ${date}</p>
            </div>
            <div class="receipt-items">
                <h4>Items Purchased:</h4>
                <ul>
        `;
    
        cart.forEach(item => {
            const itemTotal = parseFloat(item.price.replace("₱", "")) * item.quantity;
            total += itemTotal;
            // Include size in the receipt if it exists
            const displayName = item.size ? `${item.name} (${item.size})` : item.name;
            receiptHTML += `<li>${displayName} x ${item.quantity} - ₱${itemTotal.toFixed(2)}</li>`;
        });
    
        receiptHTML += `
                </ul>
            </div>
            <div class="receipt-total">
                <h4>Total Amount: ₱${total.toFixed(2)}</h4>
                <p>Payment Status: ${paymentMethod === 'online' ? 'Paid Online' : 'To be paid at counter'}</p>
            </div>
        `;
    
        // Debug log to check cart items before updating stock
        console.log("Cart before updating stock:", JSON.stringify(cart));
    
        // Update stock levels - Make sure cart has complete item information including sizes
        updateStock(cart);
    
        // Save transaction to history
        const transaction = {
            transactionNumber: transactionNumber,
            date: date,
            items: cart.map(item => ({
                name: item.name,
                size: item.size, // Ensure size is included
                quantity: item.quantity,
                price: parseFloat(item.price.replace("₱", ""))
            })),
            total: total,
            paymentMethod: paymentMethod
        };
    
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        transactions.unshift(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    
        document.getElementById("receipt-content").innerHTML = receiptHTML;
        checkoutModal.style.display = "none";
        receiptModal.style.display = "block";
    
        // Clear the cart after successful checkout
        localStorage.removeItem("cart");
        loadCart();

        // Add a flag to indicate a refresh is needed when returning to products page
        localStorage.setItem("needsStockRefresh", "true");
    }
    
    // Function to toggle payment options visibility
    function togglePaymentOptions() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        if (selectedPayment === 'online') {
            onlinePaymentOptions.style.display = 'block';
        } else {
            onlinePaymentOptions.style.display = 'none';
        }
    }
    
    // Function to show QR code modal
    function showQRCode(type) {
        // Set the QR code image based on type
        let qrImageSrc = '';
        let title = '';
        
        if (type === 'gcash') {
            title = 'GCash Payment QR Code';
            // Using placeholder for QR code image
            qrImageSrc = "/img/qr.png";
        } else if (type === 'paymaya') {
            title = 'PayMaya Payment QR Code';
            qrImageSrc = "/img/qr.png";
        }
        
        qrTitle.textContent = title;
        qrContainer.innerHTML = `<img src="${qrImageSrc}" alt="${title}">`;
        qrModal.style.display = 'block';
    }

    // Event Listeners
    clearCartButton.addEventListener("click", function () {
        localStorage.removeItem("cart");
        loadCart();
    });

    checkoutButton.addEventListener("click", showCheckoutSummary);

    confirmOrderButton.addEventListener("click", function() {
        if (confirm("Are you sure you want to proceed with the purchase?")) {
            generateReceipt();
        }
    });

    cancelCheckoutButton.addEventListener("click", function() {
        checkoutModal.style.display = "none";
    });

    closeReceiptButton.addEventListener("click", function() {
        receiptModal.style.display = "none";
        location.reload(); // Refresh the page to show empty cart
    });
    
    // Add event listener for payment method radio buttons
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', togglePaymentOptions);
    });
    
    // Add event listeners for QR code buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('view-qr')) {
            const qrType = event.target.getAttribute('data-type');
            showQRCode(qrType);
        }
    });
    
    // Close QR modal
    closeQrButton.addEventListener('click', function() {
        qrModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener("click", function(event) {
        if (event.target === checkoutModal) {
            checkoutModal.style.display = "none";
        }
        if (event.target === receiptModal) {
            receiptModal.style.display = "none";
            location.reload();
        }
        if (event.target === qrModal) {
            qrModal.style.display = 'none';
        }
    });

    loadCart();
});