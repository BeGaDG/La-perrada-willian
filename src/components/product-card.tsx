'use client';

import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Plus, ImageIcon } from 'lucide-react';
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
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="flex items-center gap-3 md:block">
        <div className="aspect-square w-24 flex-shrink-0 md:w-full md:aspect-[3/2] relative bg-muted flex items-center justify-center md:rounded-b-none rounded-l-lg">
           {product.imageUrl ? (
            <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 30vw, (max-width: 1024px) 30vw, 25vw"
                data-ai-hint={product.imageHint}
            />
          ) : (
            <ImageIcon className="h-8 w-8 md:h-16 md:w-16 text-muted-foreground" />
          )}
        </div>

        <div className="flex-grow py-2 pr-2 md:p-4">
            <h3 className="font-semibold text-sm md:text-base leading-tight line-clamp-2 md:mb-1">{product.name}</h3>
            <div className='flex items-end justify-between'>
                <p className="text-sm md:text-lg font-bold text-primary mt-1">{formattedPrice}</p>
                <Button onClick={handleAddToCart} size="icon" className="h-8 w-8 flex-shrink-0" aria-label={`Añadir ${product.name} al carrito`}>
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </div>
    </Card>
  );
}
