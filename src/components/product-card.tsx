'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product);
    toast({
      description: `${product.name} añadido al carrito.`,
    });
  };

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-[3/2] relative">
          <Image
            src={product.imageUrl || `https://placehold.co/600x400/E2E8F0/A0AEC0?text=Sin+Imagen`}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={product.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-bold mb-1">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground h-10">{product.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xl font-bold text-primary">{formattedPrice}</p>
        <Button onClick={handleAddToCart} aria-label={`Añadir ${product.name} al carrito`}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir
        </Button>
      </CardFooter>
    </Card>
  );
}
