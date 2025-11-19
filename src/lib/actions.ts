'use client';

import { revalidatePath } from "next/cache";
import { Timestamp, addDoc, collection, doc, serverTimestamp, updateDoc, type Firestore } from "firebase/firestore";
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


export async function createOrder(firestore: Firestore, payload: CreateOrderPayload) {
    const ordersCollection = collection(firestore, "orders");

    const newOrder = {
        ...payload,
        customerId: MOCK_USER_ID, 
        status: 'PENDIENTE_PAGO' as const,
        orderDate: serverTimestamp(),
    };

    try {
        const docRef = await addDoc(ordersCollection, newOrder);
        console.log("Order created with ID: ", docRef.id);
        // revalidatePath no funciona en el cliente, pero la UI se actualizará por el listener de useCollection
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Could not create order.");
    }
}

export async function updateOrderStatus(firestore: Firestore, orderId: string, status: OrderStatus) {
  const orderRef = doc(firestore, "orders", orderId);

  const statusUpdate: { status: OrderStatus; [key: string]: any } = { status };

  const now = serverTimestamp();
  if (status === 'EN_PREPARACION') {
    statusUpdate.confirmedAt = now;
  } else if (status === 'LISTO_REPARTO') {
    statusUpdate.readyAt = now;
  } else if (status === 'COMPLETADO') {
    statusUpdate.completedAt = now;
  }

  try {
    await updateDoc(orderRef, statusUpdate);
    console.log(`Order ${orderId} updated to ${status}`);
     // revalidatePath no funciona en el cliente, pero la UI se actualizará por el listener de useCollection
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Could not update order status.");
  }
}
