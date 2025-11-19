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
import { ChevronDown, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { Textarea } from "@/components/ui/textarea";


const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function OrderSummary() {
    const { items, totalPrice, totalItems } = useCart();
    const [isOpen, setIsOpen] = React.useState(false);


    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <Card>
                <CardHeader>
                    <CollapsibleTrigger className="flex justify-between items-center w-full">
                        <div>
                            <CardTitle className="text-left">Resumen del Pedido</CardTitle>
                            <CardDescription className="text-left">
                                {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-lg whitespace-nowrap lg:hidden">
                                {formatPrice(totalPrice)}
                            </span>
                            <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>

                <CollapsibleContent>
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
                </CollapsibleContent>
                <div className="hidden lg:block">
                    <Separator />
                    <CardFooter className="pt-6">
                        <div className="flex justify-between font-bold text-lg w-full">
                            <span>Total</span>
                            <span>{formatPrice(totalPrice)}</span>
                        </div>
                    </CardFooter>
                </div>
            </Card>
        </Collapsible>
    );
}

export default function CheckoutPage() {
    const { items, totalPrice, totalItems, clearCart } = useCart();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
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
            notes: data.notes as string,
            items: items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                productName: item.product.name,
                unitPrice: item.product.price
            })),
            totalAmount: totalPrice,
        }

        startTransition(async () => {
            if (!firestore) return;
            try {
                await createOrder(firestore, orderPayload);
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
            <h1 className="text-3xl font-bold mb-8 font-headline text-center">Finalizar Compra</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative pb-24 lg:pb-0">

                {/* Columna Izquierda: Resumen en móvil y Formulario en desktop */}
                <div className="lg:hidden">
                    <OrderSummary />
                </div>

                <div className="space-y-6">
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>1. Información de Entrega</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nombre Completo</Label>
                                    <Input id="name" name="name" required autoComplete="name" />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Teléfono de Contacto</Label>
                                    <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
                                </div>
                                <div>
                                    <Label htmlFor="address">Dirección de Entrega</Label>
                                    <Input id="address" name="address" required autoComplete="street-address" />
                                </div>
                                <div>
                                    <Label htmlFor="notes">Notas del Pedido y Detalles de Dirección (Opcional)</Label>
                                    <Textarea id="notes" name="notes" placeholder="Ej: Casa de reja negra, al lado del colegio. Sin cebolla en el perro, salsas aparte." />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>2. Método de Pago</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup name="paymentMethod" defaultValue="EFECTIVO" className="space-y-2">
                                    <div className="flex items-center space-x-3 p-3 rounded-md border has-[input:checked]:border-primary">
                                        <RadioGroupItem value="EFECTIVO" id="efectivo" />
                                        <Label htmlFor="efectivo" className="flex-grow cursor-pointer">Efectivo contra entrega</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 rounded-md border has-[input:checked]:border-primary">
                                        <RadioGroupItem value="TRANSFERENCIA" id="transferencia" />
                                        <Label htmlFor="transferencia" className="flex-grow cursor-pointer">Transferencia (Bancolombia/Nequi)</Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </form>
                </div>

                {/* Columna Derecha: Resumen en Desktop */}
                <div className="hidden lg:block lg:sticky top-24 self-start">
                    <OrderSummary />
                </div>
            </div>

            {/* Footer Fijo en Móvil */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-between items-center">
                <div className="font-bold text-lg">
                    <span>Total: </span>
                    <span>{formatPrice(totalPrice)}</span>
                </div>
                <Button form="checkout-form" type="submit" size="lg" disabled={isPending}>
                    {isPending ? "Finalizando..." : "Finalizar Pedido"}
                </Button>
            </div>

            {/* Botón de envío para Desktop */}
            <div className="hidden lg:flex justify-end mt-8">
                <Button form="checkout-form" type="submit" size="lg" className="w-full lg:w-auto lg:max-w-xs" disabled={isPending}>
                    {isPending ? "Finalizando pedido..." : "Finalizar Pedido"}
                </Button>
            </div>
        </div>
    );
}
