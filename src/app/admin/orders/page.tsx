'use client';
import { useMemo, useState, useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { type Order, type OrderStatus } from '@/lib/types';
import { updateOrderStatus } from '@/lib/actions';
import { OrderCard } from '@/components/admin/orders/order-card';

const kanbanColumns: { title: string; status: OrderStatus }[] = [
  { title: 'Nuevos Pedidos', status: 'PENDIENTE_PAGO' },
  { title: 'En Preparación', status: 'EN_PREPARACION' },
  { title: 'Listo para Reparto', status: 'LISTO_REPARTO' },
  { title: 'Completado', status: 'COMPLETADO' },
];

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const ordersRef = useMemoFirebase(() => firestore ? collection(firestore, 'orders') : null, [firestore]);
  const ordersQuery = useMemoFirebase(() => ordersRef && query(ordersRef, orderBy('orderDate', 'desc')), [ordersRef]);
  const { data: remoteOrders, isLoading } = useCollection<Order>(ordersQuery);

  const [localOrders, setLocalOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (remoteOrders) {
      setLocalOrders(remoteOrders);
    }
  }, [remoteOrders]);

  const handleMoveState = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setLocalOrders(prevOrders =>
      prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );

    try {
      if (!firestore) return;
      await updateOrderStatus(firestore, orderId, newStatus);
    } catch (e) {
      // Revert on error
      setLocalOrders(remoteOrders || []);
    }
  };

  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, Order[]> = {
      PENDIENTE_PAGO: [],
      EN_PREPARACION: [],
      LISTO_REPARTO: [],
      COMPLETADO: [],
      CANCELADO: [],
    };
    localOrders.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });
    return grouped;
  }, [localOrders]);

  if (isLoading && localOrders.length === 0) {
    return <p>Cargando pedidos...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 font-headline">Panel de Pedidos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kanbanColumns.map(col => (
          <div key={col.status} className="bg-muted/50 rounded-lg p-4">
            <h2 className="font-semibold mb-4 text-center">{col.title} ({ordersByStatus[col.status]?.length || 0})</h2>
            <div className="space-y-4">
              {ordersByStatus[col.status]?.length > 0 ? (
                ordersByStatus[col.status].map(order => (
                  <OrderCard key={order.id} order={order} onMoveState={handleMoveState} />
                ))
              ) : (
                <p className='text-sm text-center text-muted-foreground pt-4'>No hay pedidos en este estado.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
