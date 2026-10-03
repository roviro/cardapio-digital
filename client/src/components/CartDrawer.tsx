import React, { useState } from 'react';
import type { CartItem, Order } from '../types';
import { api } from '../services/api';
import { 
  X, Trash2, Plus, Minus, Bike, Store, QrCode, 
  CreditCard, Banknote, CheckCircle2, Copy, Check, MessageCircle, ArrowRight 
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  defaultDeliveryFee?: number;
  storePhone?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  defaultDeliveryFee = 7.00,
  storePhone = '5511986531134'
}) => {
  if (!isOpen) return null;

  // Form State
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD' | 'CASH'>('PIX');
  const [changeFor, setChangeFor] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Submit / Confirmation State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [whatsappText, setWhatsappText] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const optsTotal = item.selectedOptions.reduce((s, o) => s + Number(o.price || 0), 0);
    return sum + (item.unitPrice + optsTotal) * item.quantity;
  }, 0);

  const deliveryFee = deliveryType === 'DELIVERY' ? defaultDeliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Por favor, informe seu nome.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Por favor, informe um WhatsApp válido com DDD.');
      return;
    }
    if (deliveryType === 'DELIVERY' && !address.trim()) {
      setErrorMsg('Por favor, informe o endereço de entrega completo.');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\D/g, ''),
        deliveryType,
        address: deliveryType === 'DELIVERY' ? address.trim() : null,
        paymentMethod,
        changeFor: changeFor ? parseFloat(changeFor.replace(',', '.')) : null,
        notes: orderNotes.trim() || null,
        items: items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          selectedOptions: it.selectedOptions,
          notes: it.notes
        }))
      };

      const res = await api.createOrder(payload);
      setCompletedOrder(res.order);
      setWhatsappText(res.whatsappFormattedText);
      onClearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar pedido.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPixCode = () => {
    if (completedOrder?.pixCopiaECola) {
      navigator.clipboard.writeText(completedOrder.pixCopiaECola);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const openWhatsAppOrder = () => {
    const phone = storePhone.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank');
  };

  const handleReset = () => {
    setCompletedOrder(null);
    setWhatsappText('');
    setCustomerName('');
    setCustomerPhone('');
    setAddress('');
    setChangeFor('');
    setOrderNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">
                {completedOrder ? 'Pedido Confirmado! 🎉' : 'Seu Pedido'}
              </span>
              {!completedOrder && items.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </span>
              )}
            </div>
            <button
              onClick={completedOrder ? handleReset : onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {completedOrder ? (
              /* Success Screen */
              <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    Pedido #{completedOrder.orderNumber}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-white">
                    Pedido Enviado com Sucesso!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    A cozinha já recebeu seu pedido e está acompanhando o status.
                  </p>
                </div>

                {/* PIX Payment Box */}
                {completedOrder.paymentMethod === 'PIX' && completedOrder.pixCopiaECola && (
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/30 space-y-3 text-left">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <QrCode className="w-4 h-4" />
                      <span>Pague via PIX para liberar o preparo</span>
                    </div>

                    {completedOrder.pixQrCode && (
                      <div className="flex justify-center p-2 bg-white rounded-lg w-40 h-40 mx-auto">
                        <img 
                          src={completedOrder.pixQrCode} 
                          alt="QR Code PIX" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold uppercase text-slate-400">
                        Código PIX Copia e Cola:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={completedOrder.pixCopiaECola}
                          className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-300 select-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={copyPixCode}
                          className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            copiedPix
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                          }`}
                        >
                          {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Direct Action */}
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Clique abaixo para enviar o comprovante do pedido diretamente no WhatsApp do restaurante:
                  </p>
                  <button
                    onClick={openWhatsAppOrder}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Enviar Pedido no WhatsApp</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    Fazer um novo pedido
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* Empty Cart */
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-800/60 border border-slate-800 flex items-center justify-center text-3xl">
                  🛒
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-200">
                    Seu carrinho está vazio
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Explore nosso cardápio e adicione seus lanches favoritos!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/30 transition-colors"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              /* Items List & Order Form */
              <form onSubmit={handleCheckout} className="space-y-6">
                {/* Items in Cart */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Itens Escolhidos
                  </h4>
                  <div className="space-y-2.5">
                    {items.map((item, index) => {
                      const itemOptsTotal = item.selectedOptions.reduce((s, o) => s + Number(o.price || 0), 0);
                      const itemTotal = (item.unitPrice + itemOptsTotal) * item.quantity;

                      return (
                        <div
                          key={index}
                          className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-semibold text-sm text-slate-100">
                                {item.productName}
                              </span>
                              <div className="text-xs text-slate-400">
                                R$ {item.unitPrice.toFixed(2).replace('.', ',')} un.
                              </div>
                            </div>
                            <span className="font-bold text-sm text-sky-400">
                              R$ {itemTotal.toFixed(2).replace('.', ',')}
                            </span>
                          </div>

                          {/* Options badges */}
                          {item.selectedOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.selectedOptions.map((opt) => (
                                <span
                                  key={opt.id}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20"
                                >
                                  + {opt.name} (R$ {Number(opt.price).toFixed(2).replace('.', ',')})
                                </span>
                              ))}
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-[11px] text-amber-300/80 italic">
                              Obs: {item.notes}
                            </p>
                          )}

                          {/* Quantity & Delete */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 mt-1">
                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                                className="p-1 rounded text-slate-400 hover:text-white"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-semibold px-1 text-slate-200">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                className="p-1 rounded text-slate-400 hover:text-white"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(index)}
                              className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                              title="Remover item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Type Switch */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tipo de Entrega
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('DELIVERY')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        deliveryType === 'DELIVERY'
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span>Delivery (Entrega)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('PICKUP')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        deliveryType === 'PICKUP'
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Retirada no Balcão</span>
                    </button>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Seus Dados
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Seu Nome Completo *"
                        className="w-full px-3 py-2 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="WhatsApp com DDD (Ex: 11999998888) *"
                        className="w-full px-3 py-2 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>

                    {deliveryType === 'DELIVERY' && (
                      <div>
                        <textarea
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Endereço de entrega completo (Rua, Número, Bairro, Complemento/Apto) *"
                          rows={2}
                          className="w-full px-3 py-2 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PIX')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium gap-1.5 transition-all ${
                        paymentMethod === 'PIX'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>PIX</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium gap-1.5 transition-all ${
                        paymentMethod === 'CARD'
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-sky-400" />
                      <span>Cartão</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium gap-1.5 transition-all ${
                        paymentMethod === 'CASH'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-amber-400" />
                      <span>Dinheiro</span>
                    </button>
                  </div>

                  {paymentMethod === 'CASH' && (
                    <div className="pt-2 animate-in fade-in duration-200">
                      <input
                        type="text"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        placeholder="Troco para quanto? (Ex: 50,00 ou deixe em branco se não precisa)"
                        className="w-full px-3 py-2 text-xs bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Order Notes */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Instruções gerais (Ex: tocar interfone 102)"
                    className="w-full px-3 py-2 text-xs bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Taxa de Entrega:</span>
                    <span>
                      {deliveryFee > 0
                        ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`
                        : 'Grátis'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                    <span>Total a Pagar:</span>
                    <span className="text-sky-400 text-base">
                      R$ {grandTotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirmar Pedido</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
