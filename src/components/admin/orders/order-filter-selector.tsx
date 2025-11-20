'use client';
import { type OrderFilterMode } from '@/lib/types';
import { Clock, Calendar, CalendarDays, Archive } from 'lucide-react';

interface OrderFilterSelectorProps {
    currentFilter: OrderFilterMode;
    onFilterChange: (filter: OrderFilterMode) => void;
    orderCount: number;
    hasActiveShift: boolean;
}

const filterOptions: {
    value: OrderFilterMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}[] = [
        {
            value: 'current-shift',
            label: 'Turno Actual',
            icon: Clock,
            description: 'Pedidos desde que abriste la tienda'
        },
        {
            value: 'today',
            label: 'Hoy',
            icon: Calendar,
            description: 'Todos los pedidos de hoy'
        },
        {
            value: 'last-7-days',
            label: 'Últimos 7 días',
            icon: CalendarDays,
            description: 'Pedidos de la última semana'
        },
        {
            value: 'all',
            label: 'Todos',
            icon: Archive,
            description: 'Todos los pedidos históricos'
        },
    ];

export function OrderFilterSelector({
    currentFilter,
    onFilterChange,
    orderCount,
    hasActiveShift
}: OrderFilterSelectorProps) {
    const currentOption = filterOptions.find(opt => opt.value === currentFilter);
    const Icon = currentOption?.icon || Clock;

    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">Mostrar:</span>
                <div className="relative group">
                    <button
                        className="flex items-center gap-2.5 px-4 py-2.5 bg-card border-2 border-primary/20 rounded-lg hover:border-primary/40 hover:bg-card/80 transition-all shadow-sm"
                        onClick={(e) => {
                            const menu = e.currentTarget.nextElementSibling as HTMLElement;
                            menu.classList.toggle('hidden');
                        }}
                    >
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">{currentOption?.label}</span>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {orderCount}
                        </span>
                        <svg className="w-4 h-4 ml-1 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className="hidden absolute top-full left-0 mt-2 w-80 bg-card border-2 border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                        {filterOptions.map((option) => {
                            const OptionIcon = option.icon;
                            const isDisabled = option.value === 'current-shift' && !hasActiveShift;
                            const isSelected = currentFilter === option.value;

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        if (!isDisabled) {
                                            onFilterChange(option.value);
                                            // Close menu
                                            const menu = document.querySelector('.group > div:not(.hidden)') as HTMLElement;
                                            if (menu) menu.classList.add('hidden');
                                        }
                                    }}
                                    disabled={isDisabled}
                                    className={`
                    w-full flex items-start gap-3 px-5 py-4 text-left transition-all border-b border-border/50 last:border-b-0
                    ${isSelected
                                            ? 'bg-primary/10 hover:bg-primary/15'
                                            : 'bg-card hover:bg-accent/50'
                                        }
                    ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                                >
                                    <OptionIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-foreground/70'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                {option.label}
                                            </span>
                                            {isSelected && (
                                                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className={`text-xs ${isSelected ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                                            {option.description}
                                            {isDisabled && ' (No hay turno activo)'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
