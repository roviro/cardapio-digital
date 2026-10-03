import type { MenuData, Product, Order, Category } from '../types';

const BASE_URL = '/api';

export const api = {
  async getMenu(): Promise<MenuData> {
    const res = await fetch(`${BASE_URL}/menu`);
    if (!res.ok) throw new Error('Falha ao carregar cardápio');
    return res.json();
  },

  async createOrder(data: any): Promise<{
    order: Order;
    whatsappFormattedText: string;
    storePhone: string;
  }> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar pedido');
    }
    return res.json();
  },

  async getOrders(status?: string): Promise<Order[]> {
    const url = status && status !== 'ALL' ? `${BASE_URL}/orders?status=${status}` : `${BASE_URL}/orders`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar pedidos');
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string, notifyCustomer = true): Promise<void> {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notifyCustomer })
    });
    if (!res.ok) throw new Error('Falha ao atualizar status');
  },

  async getAdminProducts(): Promise<Product[]> {
    const res = await fetch(`${BASE_URL}/products`);
    if (!res.ok) throw new Error('Falha ao carregar produtos');
    return res.json();
  },

  async toggleProductAvailability(id: string): Promise<{ success: boolean; isAvailable: number }> {
    const res = await fetch(`${BASE_URL}/products/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Falha ao alterar disponibilidade');
    return res.json();
  },

  async createProduct(data: any): Promise<void> {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao cadastrar produto');
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir produto');
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Falha ao carregar categorias');
    return res.json();
  },

  async getSettings(): Promise<Record<string, string>> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Falha ao carregar configurações');
    return res.json();
  },

  async updateSettings(data: Record<string, string>): Promise<void> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao salvar configurações');
  }
};
