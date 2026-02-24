const initialProducts = [
    {
        id: "1",
        name: "Hyperion X1 Smartphone",
        desc: "Next-gen holographic display with quantum chip architecture. 12GB RAM, 512GB SSD.",
        price: "185000",
        category: "Mobile",
        stock: 15,
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800",
        images: [
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800"
        ]
    },
    {
        id: "2",
        name: "Nebula Pro Laptop",
        desc: "Aerospace-grade carbon chassis. RTX 5080 integration. 300Hz OLED screen.",
        price: "450000",
        category: "Laptop",
        stock: 8,
        image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=800",
        images: [
            "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1588872661356-687d4245f4fc?auto=format&fit=crop&q=80&w=800"
        ]
    },
    {
        id: "3",
        name: "Sonic Wave Z Audio",
        desc: "Bone conduction technology with active noise cancellation. 40h battery life.",
        price: "45000",
        category: "Audio",
        stock: 10,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"]
    },
    {
        id: "4",
        name: "Karaoke Speaker - 2 Mic",
        desc: "K12 Dual Microphone Karaoke Bluetooth Speaker RGB Light Two 5W Speakers.",
        price: "2500",
        category: "Audio",
        stock: 25,
        image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&q=80&w=800",
        images: ["https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&q=80&w=800"]
    }
];

const Storage = {
    PRODUCTS_KEY: 'online_shop_products',
    ORDERS_KEY: 'online_shop_orders',

    getProducts() {
        try {
            const products = localStorage.getItem(this.PRODUCTS_KEY);
            if (!products || products === "null" || products === "undefined") {
                localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(initialProducts));
                return initialProducts;
            }
            const parsed = JSON.parse(products);
            return Array.isArray(parsed) ? parsed : initialProducts;
        } catch (e) {
            console.error("Storage Error: Corrupted data detected. Resetting to defaults.", e);
            localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(initialProducts));
            return initialProducts;
        }
    },

    getProductById(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    },

    saveProduct(product) {
        const products = this.getProducts();
        if (product.id) {
            const index = products.findIndex(p => p.id === product.id);
            if (index !== -1) {
                products[index] = { ...products[index], ...product };
            } else {
                products.push(product);
            }
        } else {
            product.id = Date.now().toString();
            products.push(product);
        }
        localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
        return product;
    },

    deleteProduct(id) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== id);
        localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(filtered));
    },

    saveOrder(order) {
        const orders = this.getOrders();
        order.id = Date.now().toString();
        order.date = new Date().toISOString();
        orders.push(order);
        localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
        return order;
    },

    getOrders() {
        try {
            const orders = localStorage.getItem(this.ORDERS_KEY);
            if (!orders || orders === "null") return [];
            const parsed = JSON.parse(orders);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }
};

window.Storage = Storage;
