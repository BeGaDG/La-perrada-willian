'use client';

import Image from 'next/image';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Plus, ImageIcon } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
      duration: 2000,
    });
  };

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <Card className="group overflow-hidden border-0 shadow-sm bg-card hover:bg-accent/5 transition-colors duration-200 rounded-2xl">
      <div className="flex p-3 gap-4 h-full">
        {/* Imagen del producto */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-muted/50 shadow-inner">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 120px, 150px"
              data-ai-hint={product.imageHint}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full text-muted-foreground/30">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex flex-col flex-grow justify-between py-0.5">
          <div>
            <h3 className="font-bold text-base leading-tight text-foreground mb-1.5 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description || "Delicioso y preparado al instante."}
            </p>
          </div>

          <div className='flex items-center justify-between mt-3'>
            <p className="text-base font-extrabold text-primary tabular-nums">
              {formattedPrice}
            </p>
            <Button
              onClick={handleAddToCart}
              size="icon"
              className="h-9 w-9 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
              aria-label={`Añadir ${product.name} al carrito`}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
