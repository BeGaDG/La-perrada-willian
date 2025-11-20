'use client';
import { useMemo, useState, useEffect } from 'react';
import { collection, query, orderBy, where, doc, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { type Order, type OrderStatus, type OrderFilterMode, type ShopSettings } from '@/lib/types';
import { updateOrderStatus } from '@/lib/actions';
import { OrderCard } from '@/components/admin/orders/order-card';
import { OrderFilterSelector } from '@/components/admin/orders/order-filter-selector';

const kanbanColumns: { title: string; status: OrderStatus }[] = [
  { title: 'Nuevos Pedidos', status: 'PENDIENTE_PAGO' },
  { title: 'En Preparación', status: 'EN_PREPARACION' },
  { title: 'Listo para Reparto', status: 'LISTO_REPARTO' },
  { title: 'Completado', status: 'COMPLETADO' },
];

// Helper function to get filter date
function getFilterDate(filterMode: OrderFilterMode, shiftStartAt?: Timestamp): Date | null {
  const now = new Date();

  switch (filterMode) {
    case 'current-shift':
      return shiftStartAt ? shiftStartAt.toDate() : null;
    case 'today':
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      return startOfToday;
    case 'last-7-days':
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return sevenDaysAgo;
    case 'all':
      return null;
    default:
      return null;
  }
}

export default function AdminOrdersPage() {
  const firestore = useFirestore();

  // Load shop settings to get shiftStartAt
  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'shop') : null, [firestore]);
  const { data: settings } = useDoc<ShopSettings>(settingsRef);

  // Load filter preference from localStorage
  const [filterMode, setFilterMode] = useState<OrderFilterMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orderFilterMode');
      return (saved as OrderFilterMode) || 'current-shift';
    }
    return 'current-shift';
  });

  // Save filter preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderFilterMode', filterMode);
    }
  }, [filterMode]);

  const ordersRef = useMemoFirebase(() => firestore ? collection(firestore, 'orders') : null, [firestore]);

  // Build query based on filter mode
  const ordersQuery = useMemoFirebase(() => {
    if (!ordersRef) return null;

    const filterDate = getFilterDate(filterMode, settings?.shiftStartAt);

    if (filterDate) {
      // Convert to Firestore Timestamp
      const firestoreTimestamp = Timestamp.fromDate(filterDate);
      return query(
        ordersRef,
        where('orderDate', '>=', firestoreTimestamp),
        orderBy('orderDate', 'desc')
      );
    } else {
      // No filter, get all orders
      return query(ordersRef, orderBy('orderDate', 'desc'));
    }
  }, [ordersRef, filterMode, settings?.shiftStartAt]);

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

  const hasActiveShift = Boolean(settings?.isOpen && settings?.shiftStartAt);

  // If current-shift is selected but no active shift, show message
  const showNoShiftMessage = filterMode === 'current-shift' && !hasActiveShift;

  if (isLoading && localOrders.length === 0) {
    return <p>Cargando pedidos...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 font-headline">Panel de Pedidos</h1>

      <OrderFilterSelector
        currentFilter={filterMode}
        onFilterChange={setFilterMode}
        orderCount={localOrders.length}
        hasActiveShift={hasActiveShift}
      />

      {showNoShiftMessage && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⚠️ No hay un turno activo. Abre la tienda desde <strong>Configuración</strong> para ver los pedidos del turno actual.
          </p>
        </div>
      )}

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
