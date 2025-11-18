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
  quantity: number;
  price: number; // price at time of order
};

export type OrderStatus = 'PENDIENTE_PAGO' | 'PAGADO' | 'EN_COCINA' | 'LISTO_PARA_RECOGER' | 'COMPLETADO' | 'CANCELADO';

export type Order = {
  id: string;
  userId: string; // Corresponds to user UID
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
};
