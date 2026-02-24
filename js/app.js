const App = {
    // Obfuscated seller number: +94722967788
    _s1: "9472",
    _s2: "2967",
    _s3: "788",

    getSellerPhone() {
        return this._s1 + this._s2 + this._s3;
    },

    init() {
        this.renderProducts('all');
        this.setupEventListeners();

        // Auto-open cart if redirected from product page
        const params = new URLSearchParams(window.location.search);
        if (params.get('openCart')) {
            document.getElementById('cartDrawer').classList.remove('translate-x-full');
        }
    },

    renderProducts(filter = 'all') {
        const grid = document.getElementById('productGrid');
        let products = Storage.getProducts();

        if (filter !== 'all') {
            products = products.filter(p => p.category === filter);
        }

        if (products.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-20 opacity-30">
                    <i class="fas fa-terminal text-6xl mb-4"></i>
                    <p class="text-xl">No inventory detected in this sector.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(p => `
            <div class="glass p-5 rounded-2xl card-hover transition-all group cursor-pointer" onclick="location.href='product.html?id=${p.id}'">
                <div class="relative overflow-hidden rounded-xl mb-4 h-48">
                    <img src="${p.image}" class="w-full h-full object-cover transition-transform group-hover:scale-110" onerror="this.src='https://placehold.co/400x300/1e293b/white?text=Tech+Item'">
                    <div class="absolute top-2 right-2 px-2 py-1 bg-cyan-500/80 backdrop-blur-md rounded text-[10px] font-bold text-slate-900 uppercase">
                        ${p.category}
                    </div>
                </div>
                <h3 class="text-xl font-bold mb-2">${p.name}</h3>
                <p class="text-slate-400 text-sm mb-4 line-clamp-2">${p.desc}</p>
                <div class="flex items-center justify-between mb-4">
                    <span class="text-2xl font-bold text-cyan-400">Rs. ${parseFloat(p.price).toLocaleString()}</span>
                    <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
                        <div class="w-2.5 h-2.5 rounded-full ${p.status === 'not_available' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}"></div>
                        <span class="text-[10px] font-bold uppercase tracking-wider ${p.status === 'not_available' ? 'text-red-400' : 'text-green-400'}">
                            ${p.status === 'not_available' ? 'Not Available' : 'Available'}
                        </span>
                    </div>
                </div>
                <button 
                    ${p.status === 'not_available' ? 'disabled' : ''}
                    class="w-full py-3 ${p.status === 'not_available' ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-900'} rounded-xl transition-all font-bold flex items-center justify-center gap-2">
                    <i class="fas ${p.status === 'not_available' ? 'fa-times-circle' : 'fa-info-circle'}"></i> 
                    ${p.status === 'not_available' ? 'Sold Out' : 'View Details & Buy'}
                </button>
            </div>
        `).join('');
    },

    addToCart(id) {
        const products = Storage.getProducts();
        const p = products.find(prod => prod.id === id);
        const qty = document.getElementById(`qty-${id}`).value;
        if (p) {
            Cart.addItem(p, qty);
            // Visual feedback
            const btn = event.currentTarget;
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Added';
            btn.classList.add('bg-green-600', 'text-white');
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.classList.remove('bg-green-600', 'text-white');
            }, 1000);
        }
    },

    setupEventListeners() {
        const cartBtn = document.getElementById('cartBtn');
        const closeCart = document.getElementById('closeCart');
        const cartDrawer = document.getElementById('cartDrawer');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const checkoutModal = document.getElementById('checkoutModal');
        const cancelCheckout = document.getElementById('cancelCheckout');
        const checkoutForm = document.getElementById('checkoutForm');
        const categoryFilter = document.getElementById('categoryFilter');

        if (cartBtn) cartBtn.onclick = () => cartDrawer.classList.remove('translate-x-full');
        if (closeCart) closeCart.onclick = () => cartDrawer.classList.add('translate-x-full');

        if (checkoutBtn) {
            checkoutBtn.onclick = () => {
                checkoutModal.classList.remove('hidden');
            };
        }

        if (cancelCheckout) cancelCheckout.onclick = () => checkoutModal.classList.add('hidden');

        if (checkoutForm) {
            checkoutForm.onsubmit = (e) => {
                e.preventDefault();
                this.processOrder();
            };
        }

        if (categoryFilter) {
            categoryFilter.onchange = (e) => {
                this.renderProducts(e.target.value);
            };
        }
    },

    processOrder() {
        const name = document.getElementById('custName').value;
        const address = document.getElementById('custAddress').value;
        const phone = document.getElementById('custPhone').value;
        const email = document.getElementById('custEmail').value;

        const order = {
            customer: { name, address, phone, email },
            items: Cart.items,
            total: Cart.getTotal()
        };

        // Save for admin view
        Storage.saveOrder(order);

        // Generate WhatsApp Message for Seller
        let message = `🚀 *NEW ORDER RECEIVED* 🚀\n\n`;
        message += `👤 *Customer:* ${name}\n`;
        message += `📍 *Address:* ${address}\n`;
        message += `📞 *Phone:* ${phone}\n`;
        message += `📧 *Email:* ${email}\n\n`;
        message += `🛒 *Items:* \n`;

        Cart.items.forEach(item => {
            message += `- ${item.name} [${item.code || 'N/A'}] x ${item.quantity} (Rs. ${item.price})\n`;
        });

        message += `\n💰 *Total Amount:* Rs. ${Cart.getTotal().toLocaleString()}\n`;
        message += `\nSystem: Please process this module stack.`;

        const encodedMsg = encodeURIComponent(message);
        const waLink = `https://wa.me/${this.getSellerPhone()}?text=${encodedMsg}`;

        // Clear cart and close modals
        Cart.clear();
        document.getElementById('checkoutModal').classList.add('hidden');
        document.getElementById('cartDrawer').classList.add('translate-x-full');
        this.renderProducts(); // Re-render

        // Open WhatsApp
        window.open(waLink, '_blank');

        alert("Order processed successfully! Redirecting to WhatsApp...");
    }
};

window.App = App;
App.init();

