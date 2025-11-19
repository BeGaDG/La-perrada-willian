'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopProduct {
    id: string;
    name: string;
    sales: number;
    revenue: number;
    imageUrl?: string;
}

interface TopProductsProps {
    products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Card className="h-full border-slate-200 flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Top Productos</CardTitle>
                <p className="text-sm text-slate-500">Más vendidos</p>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                    {products.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">No hay datos de ventas aún.</p>
                    ) : (
                        products.map((product, index) => (
                            <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-600 font-semibold text-sm">
                                    {index + 1}
                                </div>

                                <Avatar className="h-10 w-10 border border-slate-200">
                                    <AvatarImage src={product.imageUrl} alt={product.name} />
                                    <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold text-sm">
                                        {product.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{product.name}</p>
                                    <p className="text-xs text-slate-500">{product.sales} vendidos</p>
                                </div>

                                <div className="text-right">
                                    <p className="font-semibold text-sm">
                                        {formatCurrency(product.revenue)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
