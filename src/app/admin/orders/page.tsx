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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const kanbanColumns: { title: string; status: OrderStatus }[] = [
  { title: 'Nuevos Pedidos', status: 'PENDIENTE_PAGO' },
  { title: 'En Preparación', status: 'EN_PREPARACION' },
  { title: 'Listo para Reparto', status: 'LISTO_REPARTO' },
  { title: 'Completado', status: 'COMPLETADO' },
];

const statusFlow: Record<OrderStatus, { next: OrderStatus | null; prev: OrderStatus | null }> = {
    PENDIENTE_PAGO: { next: 'EN_PREPARACION', prev: null },
    EN_PREPARACION: { next: 'LISTO_REPARTO', prev: 'PENDIENTE_PAGO' },
    LISTO_REPARTO: { next: 'COMPLETADO', prev: 'EN_PREPARACION' },
    COMPLETADO: { next: null, prev: 'LISTO_REPARTO' },
    CANCELADO: { next: null, prev: null },
};

const getActionLabel = (status: OrderStatus): string => {
    if (status === 'PENDIENTE_PAGO') return 'Confirmar Pago y Enviar a Cocina';
    const next = statusFlow[status]?.next;
    if (next === 'LISTO_REPARTO') return 'Marcar como Listo para Reparto';
    if (next === 'COMPLETADO') return 'Marcar como Completado';
    return 'Avanzar';
}

const getStatusName = (status: OrderStatus): string => {
    const column = kanbanColumns.find(c => c.status === status);
    return column ? column.title : status;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function PrintTicketDialog({ order, children }: { order: Order; children: React.ReactNode }) {
  const formattedDate = order.orderDate
    ? format(order.orderDate.toDate(), "Pp", { locale: es })
    : 'N/A';

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
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
          <p>Teléfono: {order.customerPhone}</p>
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


function OrderCard({ order, onMoveState }: { order: Order, onMoveState: (orderId: string, newStatus: OrderStatus) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { next, prev } = statusFlow[order.status];
  
  return (
    <Collapsible asChild>
    <Card>
      <CardHeader className="p-4">
        <div className='flex justify-between items-start gap-2'>
          <CollapsibleTrigger className='w-full' onClick={() => setIsOpen(v => !v)}>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-left">
                  Pedido #{order.id.substring(0,5)}...
                  <p className="font-normal">{order.customerName}</p>
              </CardTitle>
              <div className='flex items-center gap-2'>
                  <Badge variant={order.paymentMethod === 'EFECTIVO' ? 'secondary' : 'outline' }>{order.paymentMethod}</Badge>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className='h-8 w-8 flex-shrink-0'>
                    <MoreVertical className='h-4 w-4' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <PrintTicketDialog order={order}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Imprimir Ticket
                    </DropdownMenuItem>
                </PrintTicketDialog>
                {prev && (
                    <DropdownMenuItem onClick={() => onMoveState(order.id, prev)}>
                        Mover a "{getStatusName(prev)}"
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CollapsibleContent>
        <CardContent className="text-sm px-4 pb-4 space-y-2">
            <Separator/>
            <div className='pt-2'>
                <p><span className='font-semibold'>Dirección:</span> {order.customerAddress}</p>
                <p><span className='font-semibold'>Teléfono:</span> {order.customerPhone}</p>
            </div>
            <Separator/>
             <div className='space-y-1'>
                <p className='font-semibold'>Productos:</p>
                {order.items.map((item, index) => (
                    <p key={index} className='text-muted-foreground'>- {item.quantity}x {item.productName}</p>
                ))}
            </div>
            <Separator/>
            <div className='flex justify-between font-bold pt-1'>
                <span>Total:</span>
                <span>{formatPrice(order.totalAmount)}</span>
            </div>
        </CardContent>
      </CollapsibleContent>
      <CardFooter className="flex flex-col gap-2 p-4 pt-0">
         {next && (
            <Button onClick={() => onMoveState(order.id, next)} className="w-full whitespace-normal h-auto">
                {getActionLabel(order.status)}
            </Button>
         )}
      </CardFooter>
    </Card>
     </Collapsible>
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

  const handleMoveState = (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setLocalOrders(prevOrders => 
      prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );

    // Call server action in the background - DISABLED FOR DEMO
    // updateOrderStatus(orderId, newStatus);
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
