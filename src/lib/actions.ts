'use server';

import { orders, products as allProducts } from "./data"; // Mock data
import type { OrderItem, Order } from "./types";
import { revalidatePath } from "next/cache";

// In a real app, this would use the authenticated user's ID
const MOCK_USER_ID = 'user-123';

export async function createOrder(items: Omit<OrderItem, 'price'>[]) {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 1000));

  const orderItems: OrderItem[] = items.map(item => {
    const product = allProducts.find(p => p.id === item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    return {
      ...item,
      price: product.price, // Use current product price
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const newOrder: Order = {
    id: `order-${Date.now()}`,
    userId: MOCK_USER_ID,
    items: orderItems,
    total,
    status: 'PENDIENTE_PAGO' as const,
    createdAt: new Date(),
  };

  // In a real app, save to a database. Here we just prepend to our mock array.
  orders.unshift(newOrder);

  // Revalidate paths that show orders
  revalidatePath('/my-orders');
  revalidatePath('/admin/orders');

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  
  const orderIndex = orders.findIndex(o => o.id === orderId);

  if (orderIndex === -1) {
    throw new Error('Order not found');
  }

  orders[orderIndex].status = status;

  revalidatePath('/my-orders');
  revalidatePath('/admin/orders');

  return orders[orderIndex];
}
