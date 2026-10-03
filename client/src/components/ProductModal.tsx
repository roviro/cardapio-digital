import React, { useState } from 'react';
import type { Product, ProductOption, CartItem } from '../types';
import { X, Plus, Minus, Check, MessageSquare } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<ProductOption[]>([]);
  const [notes, setNotes] = useState('');

  const toggleOption = (opt: ProductOption) => {
    setSelectedOptions((prev) => {
      const exists = prev.some((o) => o.id === opt.id);
      if (exists) {
        return prev.filter((o) => o.id !== opt.id);
      } else {
        return [...prev, opt];
      }
    });
  };

  const optionsTotal = selectedOptions.reduce((sum, opt) => sum + Number(opt.price || 0), 0);
  const unitTotal = Number(product.price) + optionsTotal;
  const grandTotal = unitTotal * quantity;

  const handleAdd = () => {
    onAddToCart({
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.price),
      quantity,
      selectedOptions,
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Close */}
        <div className="relative h-48 sm:h-56 bg-slate-800 overflow-hidden flex items-center justify-center">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="text-6xl select-none">🍔</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/60 text-slate-200 hover:text-white hover:bg-slate-950/90 backdrop-blur-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {product.name}
            </h3>
            {product.description && (
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>
            )}
            <div className="mt-3 text-lg font-semibold text-sky-400">
              R$ {Number(product.price).toFixed(2).replace('.', ',')}
            </div>
          </div>

          {/* Adicionais / Opções */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Turbine seu pedido (Opcional)
              </h4>
              <div className="space-y-2">
                {product.options.map((opt) => {
                  const isSelected = selectedOptions.some((o) => o.id === opt.id);
                  return (
                    <label
                      key={opt.id}
                      onClick={() => toggleOption(opt)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sky-500/10 border-sky-500/40 text-slate-100'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-sky-500 text-slate-950' : 'border border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-medium">{opt.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400">
                        + R$ {Number(opt.price).toFixed(2).replace('.', ',')}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <MessageSquare className="w-3.5 h-3.5" />
              Observações ou Retirada de Ingredientes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Sem cebola, molho à parte, carne bem passada..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-slate-100">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all flex items-center justify-between"
          >
            <span>Adicionar ao Pedido</span>
            <span className="font-bold">
              R$ {grandTotal.toFixed(2).replace('.', ',')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
