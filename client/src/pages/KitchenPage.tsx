import { useState, useEffect, useRef } from 'react';
import type { Order } from '../types';
import { api } from '../services/api';
import { playOrderBell } from '../utils/audio';
import { 
  ChefHat, Bike, Store, Clock, Volume2, VolumeX, RefreshCw, 
  CheckCircle, ArrowRight, Phone
} from 'lucide-react';

export const KitchenPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const prevOrdersCountRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const data = await api.getOrders('ALL');

      // Toca sino se houver novos pedidos chegando após a primeira carga
      const newOrdersCount = data.filter((o) => o.status === 'NEW').length;
      if (!isFirstLoadRef.current && soundEnabled && newOrdersCount > prevOrdersCountRef.current) {
        playOrderBell();
      }

      prevOrdersCountRef.current = newOrdersCount;
      isFirstLoadRef.current = false;
      setOrders(data);
    } catch (err) {
      console.error('Erro ao carregar pedidos da cozinha:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders(true);
    }, 5000); // Polling a cada 5s

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      setUpdatingId(orderId);
      await api.updateOrderStatus(orderId, nextStatus, true);
      await loadOrders(true);
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const openCustomerWhatsApp = (phone: string, orderNumber: number, name: string) => {
    const clean = phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Olá ${name}! Estamos em contato sobre o seu Pedido #${orderNumber} na nossa lanchonete.`);
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
  };

  // Divide por colunas Kanban
  const newOrders = orders.filter((o) => o.status === 'NEW');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const dispatchedOrders = orders.filter((o) => o.status === 'DISPATCHED');
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED').slice(0, 8); // últimos 8

  const formatElapsed = (dateStr: string) => {
    try {
      const diffMin = Math.round((Date.now() - new Date(dateStr).getTime()) / 60000);
      if (diffMin < 1) return 'Agora';
      if (diffMin < 60) return `Há ${diffMin} min`;
      const diffHour = Math.floor(diffMin / 60);
      return `Há ${diffHour}h ${diffMin % 60}m`;
    } catch {
      return '';
    }
  };

  const renderOrderCard = (order: Order) => {
    const isUpdating = updatingId === order.id;

    return (
      <div
        key={order.id}
        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
          order.status === 'NEW'
            ? 'bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/10'
            : order.status === 'PREPARING'
            ? 'bg-slate-900/80 border-sky-500/40 shadow-sm'
            : order.status === 'DISPATCHED'
            ? 'bg-slate-900/70 border-indigo-500/30'
            : 'bg-slate-900/50 border-slate-800/80 opacity-70'
        }`}
      >
        {/* Header do Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-extrabold text-white">
              #{order.orderNumber}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
              order.deliveryType === 'DELIVERY'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {order.deliveryType === 'DELIVERY' ? <Bike className="w-3 h-3" /> : <Store className="w-3 h-3" />}
              {order.deliveryType === 'DELIVERY' ? 'Entrega' : 'Retirada'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{formatElapsed(order.createdAt)}</span>
          </div>
        </div>

        {/* Cliente & Endereço */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">{order.customerName}</span>
            <button
              onClick={() => openCustomerWhatsApp(order.customerPhone, order.orderNumber, order.customerName)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
            >
              <Phone className="w-3 h-3" />
              <span>{order.customerPhone}</span>
            </button>
          </div>

          {order.deliveryType === 'DELIVERY' && order.address && (
            <p className="text-[11px] text-slate-400 leading-tight bg-slate-950/50 p-1.5 rounded-lg border border-slate-800">
              📍 {order.address}
            </p>
          )}

          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
            <span>Pagamento: <strong className="text-slate-300">{order.paymentMethod}</strong></span>
            {order.changeFor && (
              <span className="text-amber-400">Troco p/ R$ {order.changeFor.toFixed(2)}</span>
            )}
            <span className="font-bold text-sky-400">R$ {Number(order.total).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* Itens do Pedido */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          {order.items.map((it, idx) => {
            let parsedOpts: any[] = [];
            try {
              if (it.selectedOptions) {
                parsedOpts = typeof it.selectedOptions === 'string' ? JSON.parse(it.selectedOptions) : it.selectedOptions;
              }
            } catch {
              parsedOpts = [];
            }

            return (
              <div key={idx} className="text-xs">
                <div className="flex items-start gap-1.5">
                  <span className="font-extrabold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                    {it.quantity}x
                  </span>
                  <span className="font-semibold text-slate-100 flex-1">
                    {it.productName}
                  </span>
                </div>

                {parsedOpts.length > 0 && (
                  <div className="pl-6 text-[10px] text-sky-300 flex flex-wrap gap-1 mt-0.5">
                    {parsedOpts.map((opt: any, oIdx: number) => (
                      <span key={oIdx} className="bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                        + {opt.name}
                      </span>
                    ))}
                  </div>
                )}

                {it.notes && (
                  <div className="pl-6 text-[11px] text-amber-300 font-medium italic mt-0.5">
                    Obs: {it.notes}
                  </div>
                )}
              </div>
            );
          })}

          {order.notes && (
            <div className="text-[11px] text-amber-400/90 bg-amber-500/10 p-1.5 rounded border border-amber-500/20 mt-1">
              Nota geral: {order.notes}
            </div>
          )}
        </div>

        {/* Botões de Ação do Status */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          {order.status === 'NEW' && (
            <>
              <button
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                className="px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Rejeitar
              </button>
              <button
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Aceitar & Preparar</span>
              </button>
            </>
          )}

          {order.status === 'PREPARING' && (
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateStatus(order.id, 'DISPATCHED')}
              className="w-full py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>{order.deliveryType === 'DELIVERY' ? 'Despachar Entrega' : 'Pronto para Retirada'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {order.status === 'DISPATCHED' && (
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Concluir Pedido</span>
            </button>
          )}

          {order.status === 'DELIVERED' && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mx-auto py-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Pedido Finalizado com Sucesso</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>👨‍🍳 Painel da Cozinha & KDS</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Tempo Real
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Receba novos pedidos automaticamente, toque a campainha sonora e atualize o cliente via WhatsApp com 1 clique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Som Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Campainha Ativa' : 'Mudo'}</span>
          </button>

          {/* Test Sound Button */}
          <button
            onClick={playOrderBell}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
            title="Testar som de notificação"
          >
            🔔 Testar Som
          </button>

          {/* Refresh Manual */}
          <button
            onClick={() => loadOrders()}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Atualizar agora"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pt-6 items-start">
        {/* Coluna 1: Novos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wider">
                Novos Pedidos
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {newOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Nenhum pedido novo no momento.
              </div>
            ) : (
              newOrders.map((o) => renderOrderCard(o))
            )}
          </div>
        </div>

        {/* Coluna 2: Em Preparo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <h3 className="font-bold text-sm text-sky-300 uppercase tracking-wider">
                Em Preparo
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-500 text-slate-950">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Nenhum pedido na chapa.
              </div>
            ) : (
              preparingOrders.map((o) => renderOrderCard(o))
            )}
          </div>
        </div>

        {/* Coluna 3: Despachados / Retirada */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <h3 className="font-bold text-sm text-indigo-300 uppercase tracking-wider">
                Em Rota / Balcão
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white">
              {dispatchedOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {dispatchedOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Nenhum pedido em rota.
              </div>
            ) : (
              dispatchedOrders.map((o) => renderOrderCard(o))
            )}
          </div>
        </div>

        {/* Coluna 4: Concluídos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="font-bold text-sm text-emerald-300 uppercase tracking-wider">
                Concluídos
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
              {completedOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Histórico limpo.
              </div>
            ) : (
              completedOrders.map((o) => renderOrderCard(o))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
