import type { Timestamp } from 'firebase/firestore';

export type ProductCategory = string;

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  imageHint: string;
};

export type Category = {
  id:string;
  name: string;
};

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type OrderStatus = 'PENDIENTE_PAGO' | 'EN_PREPARACION' | 'LISTO_REPARTO' | 'COMPLETADO' | 'CANCELADO';

export type OrderFilterMode = 
  | 'current-shift'  // Turno actual (desde shiftStartAt)
  | 'today'          // Todos los pedidos de hoy
  | 'last-7-days'    // Últimos 7 días
  | 'all';           // Todos los pedidos históricos

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  orderDate: Timestamp;
  confirmedAt?: Timestamp;
  readyAt?: Timestamp;
  completedAt?: Timestamp;
  notes?: string;
};

export type ShopSettings = {
  id?: string;
  isOpen: boolean;
  shiftStartAt?: Timestamp;
};