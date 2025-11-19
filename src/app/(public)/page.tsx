'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Menu, Flame, GlassWater, Drumstick, Search, Pizza, Soup } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CategoryPills } from '@/components/category-pills';
import { cn } from '@/lib/utils';

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
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll for styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, selectedCategory, searchTerm]);

  const productsByCategory = useMemo(() => {
    if (!filteredProducts) return {};
    const grouped = filteredProducts.reduce((acc, product) => {
      (acc[product.category] = acc[product.category] || []).push(product);
      return acc;
    }, {} as Record<string, Product[]>);

    if (categories) {
      const orderedGrouped: Record<string, Product[]> = {};
      const categoryOrder = categories.map(c => c.name);
      categoryOrder.forEach(catName => {
        if (grouped[catName]) {
          orderedGrouped[catName] = grouped[catName];
        }
      })
      Object.keys(grouped).forEach(catName => {
        if (!orderedGrouped[catName]) {
          orderedGrouped[catName] = grouped[catName];
        }
      });
      return orderedGrouped;
    }

    return grouped;
  }, [filteredProducts, categories]);

  const isLoading = isLoadingProducts || isLoadingCategories;

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category !== 'all') {
      const element = document.getElementById(category);
      if (element) {
        const headerOffset = 180; // Ajuste para el header sticky + pills
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section Compacto (Mobile) / Expandido (Desktop) */}
      <section className={cn(
        "relative bg-primary/5 pt-4 pb-6 md:py-12 transition-all duration-300",
        isScrolled ? "opacity-0 -mt-20 pointer-events-none absolute w-full md:opacity-100 md:mt-0 md:static md:pointer-events-auto" : "opacity-100"
      )}>
        <div className="container px-4 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary font-headline mb-2 md:mb-4">
            Hola, ¿Qué se te antoja hoy?
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl">
            Los mejores sabores de la ciudad en tu puerta. Pide ahora y disfruta.
          </p>
        </div>
      </section>

      {/* Sticky Search & Navigation Wrapper */}
      <div className="sticky top-[64px] z-40 bg-background/95 backdrop-blur-md shadow-sm transition-all border-b border-border/50">
        {/* Search Bar */}
        <div className="container px-4 py-3 md:py-4">
          <div className="relative shadow-sm max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar hamburguesas, perros, bebidas..."
              className="pl-10 w-full bg-muted/50 border-transparent focus:bg-background transition-all rounded-xl h-11 md:h-12 md:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Pills */}
        {!isLoading && categories && (
          <div className="container px-0 md:px-4">
            <CategoryPills
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              className="border-b-0 shadow-none top-0 py-2 md:py-4 md:justify-center"
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container px-4 py-6 md:py-10">
        {isLoading && (
          <div className="space-y-4 mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted/50 p-6 rounded-full mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No encontramos resultados</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
              Intenta con otro término o navega por las categorías.
            </p>
          </div>
        )}

        <div className="space-y-8 mt-2 md:space-y-12">
          {Object.entries(productsByCategory).map(([category, categoryProducts]) => {
            if (categoryProducts.length === 0) return null;
            const Icon = categoryIcons[category] || Menu;

            return (
              <section key={category} id={category} className="scroll-mt-48 md:scroll-mt-56">
                <div className="flex items-center gap-2 mb-4 sticky top-[180px] md:top-[220px] bg-background/95 backdrop-blur-sm py-2 z-20 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:static md:mb-6">
                  {Icon && <Icon className="h-5 w-5 md:h-7 md:w-7 text-primary" />}
                  <h2 className="text-lg md:text-2xl font-bold font-headline tracking-tight">{category}</h2>
                  <span className="text-xs md:text-sm text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                    {categoryProducts.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
