import { useState, useEffect } from 'react';
import type { CartItem, MenuData } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { MenuPage } from './pages/MenuPage';
import { KitchenPage } from './pages/KitchenPage';
import { ProductsAdminPage } from './pages/ProductsAdminPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<'menu' | 'kitchen' | 'products' | 'settings'>('menu');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Carrega cardápio público
  const loadMenu = async () => {
    try {
      setIsLoadingMenu(true);
      const data = await api.getMenu();
      setMenuData(data);
    } catch (err) {
      console.error('Erro ao carregar cardápio:', err);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // Carrega contagem de pedidos pendentes para o badge da cozinha
  const loadPendingCount = async () => {
    try {
      const orders = await api.getOrders();
      const count = orders.filter((o) => o.status === 'NEW' || o.status === 'PREPARING').length;
      setPendingOrdersCount(count);
    } catch {
      // Ignora erro silencioso no polling do badge
    }
  };

  useEffect(() => {
    loadMenu();
    loadPendingCount();
    const interval = setInterval(loadPendingCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // Manipuladores de Carrinho
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      // Verifica se já existe o mesmo produto com as exatas mesmas opções e observação
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.notes === item.notes &&
          JSON.stringify(i.selectedOptions.map((o) => o.id).sort()) ===
            JSON.stringify(item.selectedOptions.map((o) => o.id).sort())
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += item.quantity;
        return next;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCartItems((prev) => {
      const next = [...prev];
      next[index].quantity = newQty;
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Totais do carrinho
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const opts = item.selectedOptions.reduce((s, o) => s + Number(o.price || 0), 0);
    return sum + (item.unitPrice + opts) * item.quantity;
  }, 0);

  const deliveryFee = parseFloat(menuData?.store?.delivery_fee || '7.00');
  const storePhone = menuData?.store?.store_phone || '5511986531134';
  const storeName = menuData?.store?.store_name || 'Roviro Burgers & Pizzas';
  const isOpen = menuData?.store?.store_is_open !== '0';

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        pendingOrdersCount={pendingOrdersCount}
        storeName={storeName}
        isOpen={isOpen}
      />

      {/* Main Content Pages */}
      <div className="flex-1">
        {currentTab === 'menu' && (
          <MenuPage
            menuData={menuData}
            isLoading={isLoadingMenu}
            onAddToCart={handleAddToCart}
            cartCount={cartCount}
            cartTotal={cartTotal}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {currentTab === 'kitchen' && <KitchenPage />}

        {currentTab === 'products' && <ProductsAdminPage />}

        {currentTab === 'settings' && <SettingsPage onSettingsSaved={loadMenu} />}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        defaultDeliveryFee={deliveryFee}
        storePhone={storePhone}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-auto text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{storeName}</span>
            <span>•</span>
            <span>Sistema Próprio de Delivery</span>
          </div>
          <div className="text-slate-400">
            Powered by <a href="https://roviro.com.br" target="_blank" rel="noreferrer" className="text-sky-400 font-semibold hover:underline">Roviro</a> • Zero comissões e pagamentos instantâneos via PIX
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
