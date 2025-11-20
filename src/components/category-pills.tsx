'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, Flame, GlassWater, Drumstick, Pizza, Soup, Utensils } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Category } from '@/lib/types';

interface CategoryPillsProps {
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    className?: string;
}

const categoryIcons: Record<string, LucideIcon> = {
    'PERROS': Flame,
    'HAMBURGUESAS': Drumstick,
    'BEBIDAS': GlassWater,
    'SUIZOS': Soup,
    'MINI SUIZOS': Soup,
    'PIZZAS': Pizza,
    'ADICIONALES': Menu,
};

export function CategoryPills({
    categories,
    selectedCategory,
    onSelectCategory,
    className
}: CategoryPillsProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to selected category
    useEffect(() => {
        if (scrollContainerRef.current) {
            const selectedElement = scrollContainerRef.current.querySelector(`[data-category="${selectedCategory}"]`) as HTMLElement;
            if (selectedElement) {
                const container = scrollContainerRef.current;
                const scrollLeft = selectedElement.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (selectedElement.clientWidth / 2);
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, [selectedCategory]);

    return (
        <div className={cn("w-full bg-background/95 backdrop-blur-sm border-b py-3 sticky top-[64px] z-30", className)}>
            <div
                ref={scrollContainerRef}
                className="flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x md:justify-center"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSelectCategory('all')}
                    className={cn(
                        "rounded-full flex-shrink-0 snap-start transition-all duration-200",
                        selectedCategory === 'all'
                            ? "shadow-md scale-105"
                            : "border-2 border-transparent bg-muted/50 text-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 hover:scale-105 hover:shadow-sm"
                    )}
                    data-category="all"
                >
                    <Utensils className="mr-2 h-4 w-4" />
                    Todo
                </Button>

                {categories?.map((cat) => {
                    const Icon = categoryIcons[cat.name] || Menu;
                    const isSelected = selectedCategory === cat.name;

                    return (
                        <Button
                            key={cat.id}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onSelectCategory(cat.name)}
                            className={cn(
                                "rounded-full flex-shrink-0 snap-start transition-all duration-200",
                                isSelected
                                    ? "shadow-md scale-105"
                                    : "border-2 border-transparent bg-muted/50 text-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 hover:scale-105 hover:shadow-sm"
                            )}
                            data-category={cat.name}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {cat.name}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
