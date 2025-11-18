'use client';
import { useMemo, useState, useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { type Order, type OrderStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateOrderStatus } from '@/lib/actions';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const kanbanColumns: { title: string; status: OrderStatus }[] = [
  { title: 'Nuevos Pedidos', status: 'PENDIENTE_PAGO' },
  { title: 'En Preparación', status: 'EN_PREPARACION' },
  { title: 'Listo para Reparto', status: 'LISTO_REPARTO' },
  { title: 'Completado', status: 'COMPLETADO' },
];

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
    PENDIENTE_PAGO: 'EN_PREPARACION',
    EN_PREPARACION: 'LISTO_REPARTO',
    LISTO_REPARTO: 'COMPLETADO',
    COMPLETADO: null,
    CANCELADO: null,
}

const getActionLabel = (status: OrderStatus): string => {
    if (status === 'PENDIENTE_PAGO') return 'Confirmar Pago y Enviar a Cocina';
    const next = nextStatus[status];
    if (next === 'LISTO_REPARTO') return 'Marcar como Listo para Reparto';
    if (next === 'COMPLETADO') return 'Marcar como Completado';
    return 'Avanzar';
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function PrintTicketDialog({ order }: { order: Order }) {
  const formattedDate = order.orderDate
    ? format(order.orderDate.toDate(), "Pp", { locale: es })
    : 'N/A';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Imprimir Ticket</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className='font-mono tracking-widest text-center'>LA PERRADA DE WILLIAM</DialogTitle>
        </DialogHeader>
        <div className="font-mono text-sm bg-stone-50 p-4 rounded-md">
          <p>TICKET DE COCINA</p>
          <p>-------------------------</p>
          <p>Pedido: #{order.id.substring(0, 5)}</p>
          <p>Cliente: {order.customerName}</p>
          <p>Dirección: {order.customerAddress}</p>
          <p>Fecha: {formattedDate}</p>
          <p>-------------------------</p>
          <div className='space-y-1 my-2'>
            {order.items.map((item, index) => (
              <p key={index} className='flex justify-between'>
                <span>{item.quantity}x {item.productName}</span>
              </p>
            ))}
          </div>
          <p>-------------------------</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function OrderCard({ order, onAdvance }: { order: Order, onAdvance: (orderId: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex justify-between">
            <span>Pedido #{order.id.substring(0,5)}...</span>
            <Badge variant={order.paymentMethod === 'EFECTIVO' ? 'secondary' : 'outline' }>{order.paymentMethod}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <p>{order.customerName}</p>
        <Separator className='my-2'/>
        <div className='flex justify-between font-semibold'>
            <span>Total:</span>
            <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
         {nextStatus[order.status] && (
            <Button onClick={() => onAdvance(order.id)} className="w-full whitespace-normal h-auto">
                {getActionLabel(order.status)}
            </Button>
         )}
         <PrintTicketDialog order={order} />
      </CardFooter>
    </Card>
  );
}


export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const ordersRef = useMemoFirebase(() => collection(firestore, 'orders'), [firestore]);
  const ordersQuery = useMemoFirebase(() => ordersRef && query(ordersRef, orderBy('orderDate', 'desc')), [ordersRef]);
  const { data: remoteOrders, isLoading } = useCollection<Order>(ordersQuery);

  const [localOrders, setLocalOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (remoteOrders) {
      setLocalOrders(remoteOrders);
    }
  }, [remoteOrders]);

  const handleAdvanceState = (orderId: string) => {
    const orderToUpdate = localOrders.find(o => o.id === orderId);
    if (!orderToUpdate) return;
    
    const next = nextStatus[orderToUpdate.status];
    if (!next) return;

    // Optimistic UI update
    setLocalOrders(prevOrders => 
      prevOrders.map(o => o.id === orderId ? { ...o, status: next } : o)
    );

    // Call server action in the background - DISABLED FOR DEMO
    // updateOrderStatus(orderId, next).catch(error => {
    //   console.error("Failed to update order status:", error);
    //   // Revert UI change on error
    //   setLocalOrders(prevOrders =>
    //     prevOrders.map(o => o.id === orderId ? { ...o, status: orderToUpdate.status } : o)
    //   );
    // });
  };

  const ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, Order[]> = {
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
                {ordersByStatus[col.status].length > 0 ? (
                    ordersByStatus[col.status].map(order => (
                        <OrderCard key={order.id} order={order} onAdvance={handleAdvanceState} />
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
