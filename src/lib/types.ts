import type { Timestamp } from 'firebase/firestore';

export type ProductCategory = 'Perros Calientes' | 'Hamburguesas' | 'Bebidas' | 'Otros';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  imageHint: string;
};

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type OrderStatus = 'PENDIENTE_PAGO' | 'EN_PREPARACION' | 'LISTO_REPARTO' | 'COMPLETADO' | 'CANCELADO';

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
  orderDate: Timestamp | Date; // Allow both for client-side and server-side representations
};
