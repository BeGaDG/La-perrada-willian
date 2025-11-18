'use client';

import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/actions";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

export default function CheckoutPage() {
    const { items, totalPrice, totalItems, clearCart } = useCart();
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = React.useTransition();

    if (totalItems === 0 && !isPending) {
        return (
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
                <p className="text-muted-foreground">Añade algunos productos antes de proceder al pago.</p>
                <Button onClick={() => router.push('/')} className="mt-4">Volver al menú</Button>
            </div>
        )
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const orderPayload = {
            customerName: data.name as string,
            customerPhone: data.phone as string,
            customerAddress: data.address as string,
            paymentMethod: data.paymentMethod as string,
            items: items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                productName: item.product.name,
                unitPrice: item.product.price
            })),
            totalAmount: totalPrice,
        }

        startTransition(async () => {
            try {
                await createOrder(orderPayload);
                toast({
                    title: "¡Pedido Realizado!",
                    description: "Tu pedido ha sido creado y está pendiente de pago.",
                });
                clearCart();
                router.push(`/confirmation?paymentMethod=${orderPayload.paymentMethod}`);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo crear el pedido. Intenta de nuevo.",
                });
            }
        });
    };


    return (
        <div className="container py-12 md:py-16">
            <h1 className="text-3xl font-bold mb-8 font-headline">Finalizar Compra</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Información de Entrega</h2>
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" name="name" required />
                        </div>
                        <div>
                            <Label htmlFor="phone">Teléfono de Contacto</Label>
                            <Input id="phone" name="phone" type="tel" required />
                        </div>
                        <div>
                            <Label htmlFor="address">Dirección de Entrega</Label>
                            <Input id="address" name="address" required />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Método de Pago</h3>
                            <RadioGroup name="paymentMethod" defaultValue="EFECTIVO" className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="EFECTIVO" id="efectivo" />
                                    <Label htmlFor="efectivo">Efectivo contra entrega</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="TRANSFERENCIA" id="transferencia" />
                                    <Label htmlFor="transferencia">Transferencia (Bancolombia/Nequi)</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </form>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen del Pedido</CardTitle>
                        <CardDescription>Tienes {totalItems} productos en tu carrito.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map(item => (
                             <div key={item.product.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                     {item.product.imageUrl ? (
                                        <Image src={item.product.imageUrl} alt={item.product.name} width={48} height={48} className="rounded-md aspect-square object-cover" data-ai-hint={item.product.imageHint || ''} />
                                     ) : (
                                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                     )}
                                    <div>
                                        <p className="font-semibold">{item.product.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.quantity} x {formatPrice(item.product.price)}</p>
                                    </div>
                                </div>
                                <p className="font-semibold">{formatPrice(item.quantity * item.product.price)}</p>
                            </div>
                        ))}
                         <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button form="checkout-form" type="submit" className="w-full" size="lg" disabled={isPending}>
                             {isPending ? "Finalizando pedido..." : "Finalizar Pedido"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
