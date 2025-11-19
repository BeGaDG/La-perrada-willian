import { useState } from 'react';
import { type Order, type OrderStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, MoreVertical, Printer, MessageSquare } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PrintTicketDialog } from './print-ticket-dialog';

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
    // This function was originally in page.tsx and depended on kanbanColumns.
    // I'll duplicate the mapping here for simplicity or I could export it from a shared constants file.
    // For now, a simple map is fine.
    const map: Record<string, string> = {
        'PENDIENTE_PAGO': 'Nuevos Pedidos',
        'EN_PREPARACION': 'En Preparación',
        'LISTO_REPARTO': 'Listo para Reparto',
        'COMPLETADO': 'Completado',
        'CANCELADO': 'Cancelado'
    };
    return map[status] || status;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

export function OrderCard({ order, onMoveState }: { order: Order, onMoveState: (orderId: string, newStatus: OrderStatus) => void }) {
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
                                    Pedido #{order.id.substring(0, 5)}...
                                    <p className="font-normal">{order.customerName}</p>
                                </CardTitle>
                                <div className='flex items-center gap-2'>
                                    <Badge variant={order.paymentMethod === 'EFECTIVO' ? 'secondary' : 'outline'}>{order.paymentMethod}</Badge>
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
                        <Separator />
                        <div className='pt-2'>
                            <p><span className='font-semibold'>Dirección:</span> {order.customerAddress}</p>
                            <p><span className='font-semibold'>Teléfono:</span> {order.customerPhone}</p>
                        </div>
                        {order.notes && (
                            <>
                                <Separator />
                                <div className='pt-2'>
                                    <p className='font-semibold flex items-center gap-2'><MessageSquare className='h-4 w-4' /> Nota del cliente:</p>
                                    <p className='text-muted-foreground pl-6 whitespace-pre-wrap'>{order.notes}</p>
                                </div>
                            </>
                        )}
                        <Separator />
                        <div className='space-y-1'>
                            <p className='font-semibold'>Productos:</p>
                            {order.items.map((item, index) => (
                                <p key={index} className='text-muted-foreground'>- {item.quantity}x {item.productName}</p>
                            ))}
                        </div>
                        <Separator />
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
