import React from 'react';
import { UtensilsCrossed, ChefHat, Package, Settings, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  currentTab: 'menu' | 'kitchen' | 'products' | 'settings';
  setCurrentTab: (tab: 'menu' | 'kitchen' | 'products' | 'settings') => void;
  cartCount: number;
  onOpenCart: () => void;
  pendingOrdersCount?: number;
  storeName?: string;
  isOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  cartCount,
  onOpenCart,
  pendingOrdersCount = 0,
  storeName = 'Roviro Burgers & Pizzas',
  isOpen = true
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('menu')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold">
              🍔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-base sm:text-lg tracking-tight">
                  {storeName}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  isOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                  {isOpen ? 'Aberto' : 'Fechado'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Cardápio Digital Sem Taxas de iFood
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('menu')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'menu'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span className="hidden sm:inline">Cardápio</span>
            </button>

            <button
              onClick={() => setCurrentTab('kitchen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                currentTab === 'kitchen'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Cozinha</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'products'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden md:inline">Produtos</span>
            </button>

            <button
              onClick={() => setCurrentTab('settings')}
              className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all ${
                currentTab === 'settings' ? 'text-sky-400 bg-sky-500/20 border border-sky-500/30' : ''
              }`}
              title="Configurações da Loja"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Cart Button (Always visible on menu tab) */}
            {currentTab === 'menu' && (
              <button
                onClick={onOpenCart}
                className="ml-1 sm:ml-2 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="font-semibold">{cartCount}</span>
                <span className="hidden sm:inline">Ver Pedido</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
