'use client';

import { useMemo, useState } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Menu, Flame, GlassWater, Drumstick, Search, Pizza, Soup } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const categoryIcons: Record<string, LucideIcon> = {
  'PERROS': Flame,
  'HAMBURGUESAS': Drumstick,
  'BEBIDAS': GlassWater,
  'SUIZOS': Soup,
  'MINI SUIZOS': Soup,
  'PIZZAS': Pizza,
  'ADICIONALES': Menu,
};

export default function Home() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const productsRef = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsRef);

  const categoriesRef = useMemoFirebase(() => collection(firestore, 'categories'), [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesRef);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter(product => 
        selectedCategory === 'all' || product.category === selectedCategory
      )
      .filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, selectedCategory, searchTerm]);

  const productsByCategory = useMemo(() => {
    if (!filteredProducts) return {};
    const grouped = filteredProducts.reduce((acc, product) => {
      (acc[product.category] = acc[product.category] || []).push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    // Ordenar las categorías según el orden original si es posible
    if (categories) {
        const orderedGrouped: Record<string, Product[]> = {};
        const categoryOrder = categories.map(c => c.name);
        categoryOrder.forEach(catName => {
            if(grouped[catName]) {
                orderedGrouped[catName] = grouped[catName];
            }
        })
        // Añadir categorías que puedan no estar en la lista principal
         Object.keys(grouped).forEach(catName => {
            if(!orderedGrouped[catName]) {
                orderedGrouped[catName] = grouped[catName];
            }
        });
        return orderedGrouped;
    }

    return grouped;
  }, [filteredProducts, categories]);

  const isLoading = isLoadingProducts || isLoadingCategories;

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

       <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="container py-4 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar producto..."
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                 <div className="h-9 w-full bg-muted rounded-md animate-pulse"></div>
            ) : (
             <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="inline-flex h-auto">
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        {categories?.map(cat => (
                            <TabsTrigger key={cat.id} value={cat.name}>{cat.name}</TabsTrigger>
                        ))}
                    </TabsList>
                </ScrollArea>
             </Tabs>
            )}
        </div>
      </div>

      <div className="container py-12 md:py-16">
        {isLoading && <p className="text-center">Cargando menú...</p>}
        
        {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
                <p className="text-lg font-semibold">No se encontraron productos</p>
                <p className="text-muted-foreground">Intenta cambiar los filtros o el término de búsqueda.</p>
            </div>
        )}

        {Object.entries(productsByCategory).map(([category, categoryProducts]) => {
          if (categoryProducts.length === 0) return null;
          const Icon = categoryIcons[category] || Menu;
          return (
            <section key={category} id={category} className="mb-12 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                {Icon && <Icon className="h-8 w-8 text-primary" />}
                <h2 className="text-3xl font-bold font-headline">{category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
