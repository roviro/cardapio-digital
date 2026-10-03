import type { MenuData, Product, Order, Category } from '../types';

const BASE_URL = '/api';

const STORAGE_KEYS = {
  MENU: 'roviro_cardapio_menu',
  ORDERS: 'roviro_cardapio_orders',
  PRODUCTS: 'roviro_cardapio_products',
  CATEGORIES: 'roviro_cardapio_categories',
  SETTINGS: 'roviro_cardapio_settings'
};

function getStoredOrInit<T>(key: string, initData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initData));
      return initData;
    }
    return JSON.parse(item);
  } catch {
    return initData;
  }
}

function saveStore<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Falha ao salvar no localStorage demo:', e);
  }
}

const defaultStoreSettings: Record<string, string> = {
  store_name: 'Burger & Beer Roviro Express',
  store_phone: '5511986531134',
  delivery_fee: '7.50',
  min_order_value: '25.00',
  opening_hours: '18:00 às 23:30',
  pix_key: 'roviro221@gmail.com',
  pix_key_type: 'EMAIL',
  pix_receiver_name: 'Roviro Burger Express'
};

const defaultCategories: Category[] = [
  { id: 'cat_burgers', name: 'Hambúrgueres Artesanais', icon: '🍔', sortOrder: 1 },
  { id: 'cat_sides', name: 'Acompanhamentos', icon: '🍟', sortOrder: 2 },
  { id: 'cat_drinks', name: 'Bebidas Geladas', icon: '🥤', sortOrder: 3 }
];

const defaultProducts: Product[] = [
  {
    id: 'prod_1',
    categoryId: 'cat_burgers',
    categoryName: 'Hambúrgueres Artesanais',
    name: 'Smash Roviro Duplo',
    description: 'Dois smash burgers de 90g, cheddar inglês derretido, cebola caramelizada e maionese defumada no pão brioche amanteigado.',
    price: 34.90,
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    options: [
      { id: 'opt_1', productId: 'prod_1', name: 'Cheddar Inglês Extra', price: 4.00, maxQuantity: 2 },
      { id: 'opt_2', productId: 'prod_1', name: 'Bacon Crocante Fatiado', price: 5.00, maxQuantity: 2 },
      { id: 'opt_3', productId: 'prod_1', name: 'Picles Artesanal da Casa', price: 3.00, maxQuantity: 1 }
    ]
  },
  {
    id: 'prod_2',
    categoryId: 'cat_burgers',
    categoryName: 'Hambúrgueres Artesanais',
    name: 'Cheddar & Bacon Crispy',
    description: 'Burger 180g grelhado na brasa, creme de queijo cheddar especial e fatias generosas de bacon crocante.',
    price: 38.90,
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    options: [
      { id: 'opt_4', productId: 'prod_2', name: 'Bacon em Dobro', price: 6.00, maxQuantity: 2 },
      { id: 'opt_5', productId: 'prod_2', name: 'Maionese Especial Extra', price: 3.00, maxQuantity: 1 }
    ]
  },
  {
    id: 'prod_3',
    categoryId: 'cat_burgers',
    categoryName: 'Hambúrgueres Artesanais',
    name: 'Classic Salad Burger',
    description: 'Burger 160g, queijo prato, alface americana fresca, tomate italiano e molho especial da casa.',
    price: 29.90,
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    options: [
      { id: 'opt_6', productId: 'prod_3', name: 'Ovo Frito na Manteiga', price: 3.00, maxQuantity: 1 }
    ]
  },
  {
    id: 'prod_4',
    categoryId: 'cat_sides',
    categoryName: 'Acompanhamentos',
    name: 'Batata Rústica com Alecrim',
    description: 'Batatas cortadas à mão, crocantes por fora e macias por dentro, com alecrim fresco e flor de sal.',
    price: 18.00,
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    options: []
  },
  {
    id: 'prod_5',
    categoryId: 'cat_sides',
    categoryName: 'Acompanhamentos',
    name: 'Coxinhas de Costela (6 un)',
    description: 'Massa cremosa de mandioca recheada com costela desfiada e defumada, acompanhadas de geleia de pimenta.',
    price: 24.00,
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
    options: []
  },
  {
    id: 'prod_6',
    categoryId: 'cat_drinks',
    categoryName: 'Bebidas Geladas',
    name: 'Coca-Cola Zero Lata 350ml',
    description: 'Lata bem gelada.',
    price: 7.00,
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    options: []
  },
  {
    id: 'prod_7',
    categoryId: 'cat_drinks',
    categoryName: 'Bebidas Geladas',
    name: 'Suco de Laranja Natural 500ml',
    description: '100% fruta espremida na hora, sem conservantes.',
    price: 11.00,
    isAvailable: 1,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
    options: []
  }
];

const defaultOrders: Order[] = [
  {
    id: 'ord_101',
    orderNumber: 101,
    customerName: 'Lucas Mendes',
    customerPhone: '11999881122',
    deliveryType: 'DELIVERY',
    address: 'Av. Paulista, 1500 - Ap 42, Bela Vista',
    paymentMethod: 'PIX',
    subtotal: 41.90,
    deliveryFee: 7.50,
    total: 49.40,
    status: 'NEW',
    notes: 'Favor tocar interfone 42.',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    items: [
      {
        id: 'item_1',
        orderId: 'ord_101',
        productName: 'Smash Roviro Duplo',
        quantity: 1,
        unitPrice: 34.90,
        optionsTotal: 0,
        selectedOptions: 'Cheddar Inglês Extra'
      },
      {
        id: 'item_2',
        orderId: 'ord_101',
        productName: 'Coca-Cola Zero Lata 350ml',
        quantity: 1,
        unitPrice: 7.00,
        optionsTotal: 0
      }
    ]
  },
  {
    id: 'ord_102',
    orderNumber: 102,
    customerName: 'Camila Rodrigues',
    customerPhone: '11988772233',
    deliveryType: 'PICKUP',
    paymentMethod: 'PIX',
    subtotal: 56.90,
    deliveryFee: 0,
    total: 56.90,
    status: 'PREPARING',
    notes: 'Vou retirar em 20 minutos no balcão.',
    createdAt: new Date(Date.now() - 1500000).toISOString(),
    items: [
      {
        id: 'item_3',
        orderId: 'ord_102',
        productName: 'Cheddar & Bacon Crispy',
        quantity: 1,
        unitPrice: 38.90,
        optionsTotal: 0,
        selectedOptions: 'Bacon em Dobro'
      },
      {
        id: 'item_4',
        orderId: 'ord_102',
        productName: 'Batata Rústica com Alecrim',
        quantity: 1,
        unitPrice: 18.00,
        optionsTotal: 0
      }
    ]
  },
  {
    id: 'ord_103',
    orderNumber: 103,
    customerName: 'Marcelo Souza',
    customerPhone: '11977663344',
    deliveryType: 'DELIVERY',
    address: 'Rua Augusta, 850 - Consolação',
    paymentMethod: 'CARD',
    subtotal: 29.90,
    deliveryFee: 7.50,
    total: 37.40,
    status: 'DISPATCHED',
    createdAt: new Date(Date.now() - 2700000).toISOString(),
    items: [
      {
        id: 'item_5',
        orderId: 'ord_103',
        productName: 'Classic Salad Burger',
        quantity: 1,
        unitPrice: 29.90,
        optionsTotal: 0
      }
    ]
  }
];

export const api = {
  async getMenu(): Promise<MenuData> {
    try {
      const res = await fetch(`${BASE_URL}/menu`);
      if (res.ok) return await res.json();
    } catch {}
    const store = getStoredOrInit(STORAGE_KEYS.SETTINGS, defaultStoreSettings);
    const categories = getStoredOrInit(STORAGE_KEYS.CATEGORIES, defaultCategories);
    const products = getStoredOrInit(STORAGE_KEYS.PRODUCTS, defaultProducts);

    const categoriesWithProducts = categories.map(cat => ({
      ...cat,
      products: products.filter(p => p.categoryId === cat.id && p.isAvailable === 1)
    }));

    return {
      store,
      categories: categoriesWithProducts
    };
  },

  async createOrder(data: any): Promise<{
    order: Order;
    whatsappFormattedText: string;
    storePhone: string;
  }> {
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getStoredOrInit(STORAGE_KEYS.ORDERS, defaultOrders);
    const nextNum = orders.length > 0 ? Math.max(...orders.map(o => o.orderNumber)) + 1 : 101;
    const orderId = 'ord_' + Date.now();

    const orderItems = (data.items || []).map((it: any, idx: number) => ({
      id: `it_${orderId}_${idx}`,
      orderId,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      optionsTotal: (it.selectedOptions || []).reduce((acc: number, o: any) => acc + (o.price || 0), 0),
      selectedOptions: (it.selectedOptions || []).map((o: any) => o.name).join(', '),
      notes: it.notes
    }));

    const newOrder: Order = {
      id: orderId,
      orderNumber: nextNum,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryType: data.deliveryType,
      address: data.address,
      paymentMethod: data.paymentMethod,
      changeFor: data.changeFor,
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      total: data.total,
      status: 'NEW',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      items: orderItems,
      pixCopiaECola: data.paymentMethod === 'PIX' ? `00020101021226840014br.gov.bcb.pix2562pix.roviro.com/qr/ped_${nextNum}5802BR5913RoviroBurger6009SaoPaulo62070503***6304${nextNum}` : undefined
    };

    orders.unshift(newOrder);
    saveStore(STORAGE_KEYS.ORDERS, orders);

    const store = getStoredOrInit(STORAGE_KEYS.SETTINGS, defaultStoreSettings);
    const itemsText = newOrder.items.map(i => `• ${i.quantity}x *${i.productName}* (R$ ${(i.unitPrice * i.quantity).toFixed(2)})${i.selectedOptions ? ` [${i.selectedOptions}]` : ''}`).join('\n');
    const msg = `🍔 *NOVO PEDIDO #${newOrder.orderNumber}*\n\n*Cliente:* ${newOrder.customerName}\n*Contato:* ${newOrder.customerPhone}\n*Tipo:* ${newOrder.deliveryType === 'DELIVERY' ? `Entrega em: ${newOrder.address}` : 'Retirada no Balcão'}\n\n*Itens:*\n${itemsText}\n\n*Taxa Entrega:* R$ ${newOrder.deliveryFee.toFixed(2)}\n*TOTAL:* R$ ${newOrder.total.toFixed(2)}\n*Pagamento:* ${newOrder.paymentMethod}${newOrder.changeFor ? ` (Troco para R$ ${newOrder.changeFor})` : ''}\n\nObrigado por pedir conosco! 🚀`;

    return {
      order: newOrder,
      whatsappFormattedText: msg,
      storePhone: store.store_phone || '5511986531134'
    };
  },

  async getOrders(status?: string): Promise<Order[]> {
    try {
      const url = status && status !== 'ALL' ? `${BASE_URL}/orders?status=${status}` : `${BASE_URL}/orders`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {}

    const orders = getStoredOrInit(STORAGE_KEYS.ORDERS, defaultOrders);
    if (!status || status === 'ALL') return orders;
    return orders.filter(o => o.status === status);
  },

  async updateOrderStatus(orderId: string, status: string, notifyCustomer = true): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notifyCustomer })
      });
      if (res.ok) return;
    } catch {}

    const orders = getStoredOrInit(STORAGE_KEYS.ORDERS, defaultOrders).map(o => {
      if (o.id === orderId) {
        return { ...o, status: status as any };
      }
      return o;
    });
    saveStore(STORAGE_KEYS.ORDERS, orders);
  },

  async getAdminProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${BASE_URL}/products`);
      if (res.ok) return await res.json();
    } catch {}
    return getStoredOrInit(STORAGE_KEYS.PRODUCTS, defaultProducts);
  },

  async toggleProductAvailability(id: string): Promise<{ success: boolean; isAvailable: number }> {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) return await res.json();
    } catch {}

    let newStatus = 1;
    const products = getStoredOrInit(STORAGE_KEYS.PRODUCTS, defaultProducts).map(p => {
      if (p.id === id) {
        newStatus = p.isAvailable === 1 ? 0 : 1;
        return { ...p, isAvailable: newStatus };
      }
      return p;
    });
    saveStore(STORAGE_KEYS.PRODUCTS, products);
    return { success: true, isAvailable: newStatus };
  },

  async createProduct(data: any): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return;
    } catch {}

    const products = getStoredOrInit(STORAGE_KEYS.PRODUCTS, defaultProducts);
    const newProd: Product = {
      id: 'prod_' + Date.now(),
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: Number(data.price),
      isAvailable: 1,
      image: data.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      options: data.options || []
    };
    products.push(newProd);
    saveStore(STORAGE_KEYS.PRODUCTS, products);
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (res.ok) return;
    } catch {}

    const products = getStoredOrInit(STORAGE_KEYS.PRODUCTS, defaultProducts).filter(p => p.id !== id);
    saveStore(STORAGE_KEYS.PRODUCTS, products);
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${BASE_URL}/categories`);
      if (res.ok) return await res.json();
    } catch {}
    return getStoredOrInit(STORAGE_KEYS.CATEGORIES, defaultCategories);
  },

  async getSettings(): Promise<Record<string, string>> {
    try {
      const res = await fetch(`${BASE_URL}/settings`);
      if (res.ok) return await res.json();
    } catch {}
    return getStoredOrInit(STORAGE_KEYS.SETTINGS, defaultStoreSettings);
  },

  async updateSettings(data: Record<string, string>): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return;
    } catch {}
    saveStore(STORAGE_KEYS.SETTINGS, data);
  }
};

