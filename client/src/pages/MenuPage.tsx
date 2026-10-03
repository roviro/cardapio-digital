import React, { useState, useMemo } from 'react';
import type { MenuData, Product, CartItem } from '../types';
import { Search, Clock, Bike, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { ProductModal } from '../components/ProductModal';

interface MenuPageProps {
  menuData: MenuData | null;
  isLoading: boolean;
  onAddToCart: (item: CartItem) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  menuData,
  isLoading,
  onAddToCart,
  cartCount,
  cartTotal,
  onOpenCart
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = menuData?.categories || [];
  const store = menuData?.store || {};

  // Flatten and filter products
  const filteredProducts = useMemo(() => {
    if (!menuData) return [];

    let list: (Product & { categoryName: string })[] = [];
    for (const cat of categories) {
      if (cat.products) {
        for (const p of cat.products) {
          list.push({ ...p, categoryName: cat.name });
        }
      }
    }

    if (selectedCategoryId !== 'ALL') {
      list = list.filter((p) => p.categoryId === selectedCategoryId);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [menuData, selectedCategoryId, searchTerm, categories]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Carregando cardápio irresistível...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 pt-8 pb-10">
        <div className="absolute inset-0 bg-radial from-sky-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sem intermediários • Peça direto e ganhe desconto</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {store.store_name || 'Roviro Burgers & Pizzas'}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl">
                Burgers artesanais smash e pizzas de fermentação natural. Ingredientes frescos e entrega rápida!
              </p>

              {/* Badges Info */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{store.estimated_time || '35-50 min'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <Bike className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Taxa: R$ {parseFloat(store.delivery_fee || '7.00').toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">Aceita PIX e Cartões</span>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar lanche, pizza ou bebida..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Bar (Sticky) */}
      <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategoryId('ALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategoryId === 'ALL'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              🔥 Todos os Itens
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategoryId === cat.id
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{cat.icon || '🍴'}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">
              Nenhum item encontrado
            </h3>
            <p className="text-xs text-slate-500">
              Tente buscar por outro termo ou selecione outra categoria acima.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const isAvailable = product.isAvailable === 1;

              return (
                <div
                  key={product.id}
                  onClick={() => isAvailable && setSelectedProduct(product)}
                  className={`group relative rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden ${
                    isAvailable
                      ? 'glass-card border-slate-800/80 hover:border-sky-500/40 hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-sky-500/10'
                      : 'bg-slate-900/40 border-slate-800/50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Product Image / Visual */}
                  <div className="relative h-44 bg-slate-800/80 overflow-hidden flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-5xl select-none">🍔</div>
                    )}

                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Esgotado no Momento
                        </span>
                      </div>
                    )}

                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/70 text-slate-300 backdrop-blur-md border border-white/5">
                      {product.categoryName}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                      <div>
                        <span className="text-[11px] text-slate-400 block">A partir de</span>
                        <span className="text-base font-extrabold text-sky-400">
                          R$ {Number(product.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {isAvailable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 font-semibold text-xs transition-all active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Product Customization Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={onAddToCart}
      />

      {/* Floating Bottom Cart Bar (Sticky for Mobile & Quick Access) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-30 animate-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={onOpenCart}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-between active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-extrabold">
                {cartCount}
              </span>
              <span>Ver Pedido</span>
            </div>
            <div className="text-emerald-100 font-extrabold text-base">
              R$ {cartTotal.toFixed(2).replace('.', ',')}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
