'use server';

import { revalidatePath } from "next/cache";
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from "@/firebase/admin";
import type { OrderStatus } from "./types";

const MOCK_USER_ID = 'user-123';

type CreateOrderPayload = {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    paymentMethod: string;
    items: {
        productId: string;
        quantity: number;
        productName: string;
        unitPrice: number;
    }[];
    totalAmount: number;
};


export async function createOrder(payload: CreateOrderPayload) {
    const firestore = await getAdminFirestore();
    const ordersCollection = firestore.collection("orders");

    const newOrder = {
        ...payload,
        customerId: MOCK_USER_ID, 
        status: 'PENDIENTE_PAGO' as const,
        orderDate: FieldValue.serverTimestamp(),
    };

    try {
        const docRef = await ordersCollection.add(newOrder);
        console.log("Order created with ID: ", docRef.id);
        
        revalidatePath('/my-orders');
        revalidatePath('/admin/orders');
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Could not create order.");
    }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const firestore = await getAdminFirestore();
  const orderRef = firestore.doc(`orders/${orderId}`);

  const statusUpdate: { status: OrderStatus; [key: string]: any } = { status };

  const now = FieldValue.serverTimestamp();
  if (status === 'EN_PREPARACION') {
    statusUpdate.confirmedAt = now;
  } else if (status === 'LISTO_REPARTO') {
    statusUpdate.readyAt = now;
  } else if (status === 'COMPLETADO') {
    statusUpdate.completedAt = now;
  }

  try {
    await orderRef.update(statusUpdate);
    console.log(`Order ${orderId} updated to ${status}`);
    
    revalidatePath('/admin/orders');
    revalidatePath('/my-orders');
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Could not update order status.");
  }
}
