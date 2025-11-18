'use client';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCart } from "@/components/cart-provider";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Separator } from "./ui/separator";
import React from "react";
import { useRouter } from "next/navigation";

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

export function CartSheet({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { items, removeItem, updateItemQuantity, totalPrice } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    onOpenChange(false);
    router.push('/checkout');
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tu Carrito</SheetTitle>
        </SheetHeader>
        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-grow pr-4 -mr-6">
              <div className="flex flex-col gap-6">
                {items.map(item => (
                  <div key={item.product.id} className="flex items-start gap-4">
                    <Image 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      width={64} 
                      height={64} 
                      className="rounded-md aspect-square object-cover"
                      data-ai-hint={item.product.imageHint}
                    />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
                       <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive mt-2" onClick={() => removeItem(item.product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto">
              <div className="w-full space-y-4">
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Ir a Pagar
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">Tu carrito está vacío</h3>
            <p className="text-sm text-muted-foreground">Añade productos del menú para empezar.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
