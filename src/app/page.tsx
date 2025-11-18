'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Menu, Flame, GlassWater, Drumstick } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  'PERROS': Flame,
  'HAMBURGUESAS': Menu,
  'BEBIDAS': GlassWater,
  'SUIZOS': Drumstick,
  'MINI SUIZOS': Drumstick,
  'PIZZAS': Drumstick,
  'ADICIONALES': Drumstick,
};

export default function Home() {
  const firestore = useFirestore();
  const productsRef = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: products, isLoading } = useCollection<Product>(productsRef);

  const productsByCategory = useMemo(() => {
    if (!products) return {};
    return products.reduce((acc, product) => {
      (acc[product.category] = acc[product.category] || []).push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);


  return (
    <div>
      <section className="text-center py-16 md:py-24 bg-card border-b">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-bold text-primary font-headline">
            La Perrada de William
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            El sabor que conoces, la calidad que te encanta. Perros calientes, hamburguesas y más, preparados con el corazón.
          </p>
        </div>
      </section>

      <div className="container py-12 md:py-16">
        {isLoading && <p className="text-center">Cargando menú...</p>}
        {Object.entries(productsByCategory).map(([category, categoryProducts]) => {
          const Icon = categoryIcons[category];
          return (
            <section key={category} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                {Icon && <Icon className="h-8 w-8 text-primary" />}
                <h2 className="text-3xl font-bold font-headline">{category}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
