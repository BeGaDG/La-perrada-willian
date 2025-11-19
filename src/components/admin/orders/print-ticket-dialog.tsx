import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Order } from '@/lib/types';

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

export function PrintTicketDialog({ order, children }: { order: Order; children: React.ReactNode }) {
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
          {order.notes && (
            <div className="py-2 border-b-2 border-dashed border-stone-400 bg-yellow-100 p-2 rounded-md">
                <p className="font-semibold">NOTA:</p>
                <p className='whitespace-pre-wrap'>{order.notes}</p>
            </div>
          )}
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
