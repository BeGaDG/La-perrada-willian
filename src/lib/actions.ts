'use server';

import { revalidatePath } from "next/cache";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getSdks } from "@/firebase"; // Assuming getSdks gives you firestore instance
import type { Order, OrderItem } from "./types";
import { products as allProducts } from "./data"; // Keep using mock products for now

// In a real app, this would use the authenticated user's ID
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
        customerId: MOCK_USER_ID, // Will be replaced by real auth user ID
        status: 'PENDIENTE_PAGO' as const,
        orderDate: serverTimestamp(),
    };

    try {
        await addDoc(ordersCollection, newOrder);
        
        revalidatePath('/my-orders');
        revalidatePath('/admin/orders');
    } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Could not create order.");
    }
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  // This function would be updated to use Firestore as well
  console.log(`Updating order ${orderId} to ${status}`);
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  
  // const orderRef = doc(firestore, "orders", orderId);
  // await updateDoc(orderRef, { status });

  revalidatePath('/my-orders');
  revalidatePath('/admin/orders');

  // For now, we don't return anything as we are not updating local state
}