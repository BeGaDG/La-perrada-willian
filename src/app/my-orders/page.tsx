'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

const statusColors: Record<OrderStatus, string> = {
  PENDIENTE_PAGO: "bg-yellow-500",
  EN_PREPARACION: "bg-orange-500",
  LISTO_REPARTO: "bg-purple-500",
  COMPLETADO: "bg-green-500",
  CANCELADO: "bg-red-500",
};

const statusNames: Record<OrderStatus, string> = {
    PENDIENTE_PAGO: "Pendiente de Pago",
    EN_PREPARACION: "En Preparación",
    LISTO_REPARTO: "Listo para Reparto",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado",
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

export default function MyOrdersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const ordersRef = useMemoFirebase(() => firestore ? collection(firestore, 'orders') : null, [firestore]);
  
  // In a real app, this would use the real user ID. For now, it continues to use the mock ID.
  const MOCK_USER_ID = 'user-123';
  const ordersQuery = useMemoFirebase(() => {
    if (!ordersRef) return null;
    return query(ordersRef, where("customerId", "==", MOCK_USER_ID), orderBy("orderDate", "desc"));
  }, [ordersRef]);

  const { data: myOrders, isLoading } = useCollection<Order>(ordersQuery);

  if (isLoading || isUserLoading) {
    return (
        <div className="container py-12 md:py-16 text-center">
            <p>Cargando tus pedidos...</p>
        </div>
    )
  }

  return (
    <div className="container py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-8 font-headline">Mis Pedidos</h1>
      {myOrders && myOrders.length > 0 ? (
        <div className="space-y-8">
          {myOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="flex flex-row justify-between items-start bg-muted/50 p-4">
                  <div>
                    <CardTitle className="text-lg">Pedido #{order.id.substring(0, 5)}...</CardTitle>
                    <CardDescription>
                      {order.orderDate ? format(order.orderDate.toDate(), "PPP", { locale: es }) : 'Fecha no disponible'}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", statusColors[order.status])} />
                    {statusNames[order.status]}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={`${item.productId}-${index}`} className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-semibold">{item.productName}</p>
                                        <p className="text-sm text-muted-foreground">{item.quantity} x {formatPrice(item.unitPrice)}</p>
                                    </div>
                                </div>
                                <p className="font-semibold">{formatPrice(item.quantity * item.unitPrice)}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4">
                  <div className="flex justify-end w-full">
                    <p className="font-bold text-lg">Total: {formatPrice(order.totalAmount)}</p>
                  </div>
                </CardFooter>
              </Card>
            )
          )}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No tienes pedidos aún</h2>
          <p className="text-muted-foreground mt-2">¡Ve al menú y haz tu primer pedido!</p>
        </div>
      )}
    </div>
  );
}
