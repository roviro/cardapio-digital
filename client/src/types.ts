export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  price: number;
  maxQuantity: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: number;
  options?: ProductOption[];
  categoryName?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
  products?: Product[];
}

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  selectedOptions: ProductOption[];
  notes: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  optionsTotal: number;
  selectedOptions?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  deliveryType: 'DELIVERY' | 'PICKUP';
  address?: string;
  paymentMethod: 'PIX' | 'CARD' | 'CASH';
  changeFor?: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'NEW' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  pixCopiaECola?: string;
  pixQrCode?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface MenuData {
  store: Record<string, string>;
  categories: Category[];
}
