'use client';
import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { type Order, type OrderStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateOrderStatus } from '@/lib/actions';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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


function OrderCard({ order }: { order: Order }) {

  const handleAdvanceState = async () => {
    const next = nextStatus[order.status];
    if (next) {
        await updateOrderStatus(order.id, next);
    }
  };

  const handlePrint = () => {
    let ticket = `--- TICKET DE COCINA ---\n\n`;
    ticket += `Pedido #${order.id.substring(0, 5)}...\n`;
    ticket += `Cliente: ${order.customerName}\n`;
    ticket += `------------------------\n`;
    order.items.forEach(item => {
        ticket += `${item.quantity}x ${item.productName}\n`;
    });
    ticket += `------------------------\n`;
    console.log(ticket);
    alert('Ticket de cocina impreso en la consola.');
  }

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
            <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
         {nextStatus[order.status] && (
            <Button onClick={handleAdvanceState} className="w-full">
                {getActionLabel(order.status)}
            </Button>
         )}
         <Button onClick={handlePrint} variant="outline" className="w-full">Imprimir Ticket</Button>
      </CardFooter>
    </Card>
  );
}


export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const ordersRef = useMemoFirebase(() => collection(firestore, 'orders'), [firestore]);
  const ordersQuery = useMemoFirebase(() => ordersRef && query(ordersRef, orderBy('orderDate', 'desc')), [ordersRef]);
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, Order[]> = {
      PENDIENTE_PAGO: [],
      EN_PREPARACION: [],
      LISTO_REPARTO: [],
      COMPLETADO: [],
      CANCELADO: [],
    };
    orders?.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });
    return grouped;
  }, [orders]);

  if (isLoading) {
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
                        <OrderCard key={order.id} order={order} />
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
