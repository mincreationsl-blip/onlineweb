const Cart = {
    items: [],

    init() {
        try {
            const savedCart = localStorage.getItem('hightech_cart');
            this.items = (savedCart && savedCart !== "null") ? JSON.parse(savedCart) : [];
            if (!Array.isArray(this.items)) this.items = [];
        } catch (e) {
            console.error("Cart init error:", e);
            this.items = [];
        }
        this.updateUI();
    },

    addItem(product, quantity = 1) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += parseInt(quantity);
        } else {
            this.items.push({
                ...product,
                quantity: parseInt(quantity)
            });
        }
        this.save();
        this.updateUI();
    },

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
        this.updateUI();
    },

    updateQuantity(id, change) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.save();
                this.updateUI();
            }
        }
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    save() {
        localStorage.setItem('hightech_cart', JSON.stringify(this.items));
    },

    updateUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (cartCount) cartCount.innerText = this.items.reduce((sum, i) => sum + i.quantity, 0);

        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = '<div class="text-center py-20 opacity-30"><i class="fas fa-shopping-basket text-4xl mb-4"></i><p>Cart is empty</p></div>';
                if (checkoutBtn) checkoutBtn.disabled = true;
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="flex gap-4 items-center glass p-3 rounded-xl">
                        <img src="${item.image}" class="w-20 h-20 object-cover rounded-lg border border-slate-700">
                        <div class="flex-1">
                            <h4 class="font-bold text-sm">${item.name}</h4>
                            <p class="text-cyan-400 text-sm">Rs. ${parseFloat(item.price).toLocaleString()}</p>
                            <div class="flex items-center gap-3 mt-2">
                                <button onclick="Cart.updateQuantity('${item.id}', -1)" class="w-6 h-6 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700">-</button>
                                <span class="text-xs font-bold">${item.quantity}</span>
                                <button onclick="Cart.updateQuantity('${item.id}', 1)" class="w-6 h-6 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700">+</button>
                            </div>
                        </div>
                        <button onclick="Cart.removeItem('${item.id}')" class="text-slate-500 hover:text-red-500"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `).join('');
                if (checkoutBtn) checkoutBtn.disabled = false;
            }
        }

        if (cartTotal) cartTotal.innerText = `Rs. ${this.getTotal().toLocaleString()}`;
    },

    clear() {
        this.items = [];
        this.save();
        this.updateUI();
    }
};

window.Cart = Cart;
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});
