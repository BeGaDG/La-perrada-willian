import { orders, products } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Badge } from "@/components/ui/badge";
import { updateOrderStatus } from "@/lib/actions";
import type { OrderStatus } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const statusColors: Record<OrderStatus, string> = {
  PENDIENTE_PAGO: "border-yellow-500/50 text-yellow-600 bg-yellow-500/10",
  PAGADO: "border-blue-500/50 text-blue-600 bg-blue-500/10",
  EN_COCINA: "border-orange-500/50 text-orange-600 bg-orange-500/10",
  LISTO_PARA_RECOGER: "border-purple-500/50 text-purple-600 bg-purple-500/10",
  COMPLETADO: "border-green-500/50 text-green-600 bg-green-500/10",
  CANCELADO: "border-red-500/50 text-red-600 bg-red-500/10",
};

const statusNames: Record<OrderStatus, string> = {
    PENDIENTE_PAGO: "Pendiente de Pago",
    PAGADO: "Pagado",
    EN_COCINA: "En Cocina",
    LISTO_PARA_RECOGER: "Listo para Recoger",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado",
}

const OrderStatusSelector = ({ orderId, currentStatus }: { orderId: string, currentStatus: OrderStatus }) => {
  const handleUpdateStatus = async (status: OrderStatus) => {
    'use server'
    await updateOrderStatus(orderId, status);
  }

  return (
    <form action={handleUpdateStatus}>
       <Select defaultValue={currentStatus} name="status" onValueChange={handleUpdateStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Cambiar estado" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusNames).map(([key, value]) => (
            <SelectItem key={key} value={key}>{value}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  )
}


export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 font-headline">Gestión de Pedidos</h1>
       <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id.split('-')[1]}</TableCell>
                <TableCell>{format(order.createdAt, "P", { locale: es })}</TableCell>
                <TableCell>{order.userId}</TableCell>
                <TableCell>{order.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
       </div>
    </div>
  );
}
