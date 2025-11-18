'use server';

import { revalidatePath } from "next/cache";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { getSdks } from "@/firebase";
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
    const { firestore } = getSdks();
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
        
        revalidatePath('/my-orders');
        revalidatePath('/admin/orders');
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Could not create order.");
    }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { firestore } = getSdks();
  const orderRef = doc(firestore, "orders", orderId);

  try {
    await updateDoc(orderRef, { status: status });
    console.log(`Order ${orderId} updated to ${status}`);
    
    revalidatePath('/admin/orders');
    revalidatePath('/my-orders');
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Could not update order status.");
  }
}
