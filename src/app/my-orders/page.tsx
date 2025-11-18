import { orders, products } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

// In a real app, this would be the ID of the authenticated user.
const MOCK_USER_ID = "user-123";

const statusColors: Record<OrderStatus, string> = {
  PENDIENTE_PAGO: "bg-yellow-500",
  PAGADO: "bg-blue-500",
  EN_COCINA: "bg-orange-500",
  LISTO_PARA_RECOGER: "bg-purple-500",
  COMPLETADO: "bg-green-500",
  CANCELADO: "bg-red-500",
};

const statusNames: Record<OrderStatus, string> = {
    PENDIENTE_PAGO: "Pendiente de Pago",
    PAGADO: "Pagado",
    EN_COCINA: "En Cocina",
    LISTO_PARA_RECOGER: "Listo para Recoger",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado",
}

export default function MyOrdersPage() {
  const myOrders = orders.filter((order) => order.userId === MOCK_USER_ID);

  return (
    <div className="container py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-8 font-headline">Mis Pedidos</h1>
      {myOrders.length > 0 ? (
        <div className="space-y-8">
          {myOrders.map((order) => {
            const orderProducts = order.items.map(item => {
              const product = products.find(p => p.id === item.productId);
              return { ...item, product };
            })

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="flex flex-row justify-between items-start bg-muted/50 p-4">
                  <div>
                    <CardTitle className="text-lg">Pedido #{order.id.split('-')[1]}</CardTitle>
                    <CardDescription>
                      {format(order.createdAt, "PPP", { locale: es })}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", statusColors[order.status])} />
                    {statusNames[order.status]}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="space-y-4">
                        {orderProducts.map(item => item.product ? (
                            <div key={item.productId} className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <Image src={item.product.imageUrl} alt={item.product.name} width={48} height={48} className="rounded-md aspect-square object-cover" data-ai-hint={item.product.imageHint} />
                                    <div>
                                        <p className="font-semibold">{item.product.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.quantity} x ${item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <p className="font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        ) : null)}
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4">
                  <div className="flex justify-end w-full">
                    <p className="font-bold text-lg">Total: ${order.total.toFixed(2)}</p>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
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
