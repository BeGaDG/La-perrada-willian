'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
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
import { ChevronDown, MoreVertical, Printer } from 'lucide-react';
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
    if (status === 'PENDIENTE_PAGO') return 'Confirmar Pago';
    const next = statusFlow[status]?.next;
    if (next === 'LISTO_REPARTO') return 'Pedido Listo';
    if (next === 'COMPLETADO') return 'Completar Pedido';
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
      <DialogContent className="max-w-xs sm:max-w-sm font-mono">
        <DialogHeader className="text-center">
          <DialogTitle className='font-mono tracking-widest text-lg'>LA PERRADA DE WILLIAM</DialogTitle>
        </DialogHeader>
        <div className="text-sm bg-stone-50 p-4 rounded-md border">
          <div className="text-center pb-2 border-b-2 border-dashed border-stone-400">
             <p className="font-bold">TICKET DE COCINA</p>
             <p>Pedido: #{order.id.substring(0, 5)}</p>
             <p>{formattedDate}</p>
          </div>
          <div className="py-2 border-b-2 border-dashed border-stone-400">
            <p className="font-semibold">CLIENTE:</p>
            <p>{order.customerName}</p>
            <p>{order.customerAddress}</p>
            <p>{order.customerPhone}</p>
          </div>
          <div className='py-2 space-y-1'>
            {order.items.map((item, index) => (
              <div key={index} className='grid grid-cols-[auto_1fr_auto] gap-x-2 items-start'>
                <span className="font-semibold">{item.quantity}x</span>
                <span className='truncate'>{item.productName}</span>
                <span className='font-medium'>{formatPrice(item.unitPrice)}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t-2 border-dashed border-stone-400 text-right">
             <p className="font-bold">TOTAL: {formatPrice(order.totalAmount)}</p>
             <p className="text-xs">Método: {order.paymentMethod}</p>
          </div>
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
        <div className='flex w-full gap-2'>
            <PrintTicketDialog order={order}>
                <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">Imprimir Ticket</span>
                </Button>
            </PrintTicketDialog>
            {next && (
                <Button onClick={() => onMoveState(order.id, next)} className="w-full">
                    {getActionLabel(order.status)}
                </Button>
            )}
        </div>
      </CardFooter>
    </Card>
     </Collapsible>
  );
}


export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const ordersRef = useMemoFirebase(() => firestore ? collection(firestore, 'orders') : null, [firestore]);
  const ordersQuery = useMemoFirebase(() => ordersRef && query(ordersRef, orderBy('orderDate', 'desc')), [ordersRef]);
  const { data: remoteOrders, isLoading } = useCollection<Order>(ordersQuery);

  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const notifiedOrderIds = useRef(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);


  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (remoteOrders) {
      // Check for new orders that haven't been notified yet
      const newOrders = remoteOrders.filter(
        order => order.status === 'PENDIENTE_PAGO' && !notifiedOrderIds.current.has(order.id)
      );

      if (newOrders.length > 0) {
        newOrders.forEach(order => {
          // Show notification
          if (Notification.permission === "granted") {
            new Notification("¡Nuevo Pedido!", {
              body: `Pedido de ${order.customerName} por ${formatPrice(order.totalAmount)}.`,
              icon: "/favicon.ico",
              tag: order.id, // Use order ID as tag to prevent multiple notifications for the same order
            });

             // Play sound
            audioRef.current?.play().catch(e => console.error("Error playing sound:", e));
          }
          notifiedOrderIds.current.add(order.id);
        });
      }

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
      {/* Audio element for notification sound */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
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
