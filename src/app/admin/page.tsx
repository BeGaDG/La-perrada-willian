'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, Timestamp, doc } from 'firebase/firestore';
import { KPICard } from '@/components/admin/dashboard/kpi-card';
import { TopProducts } from '@/components/admin/dashboard/top-products';
import { RecentSalesChart } from '@/components/admin/dashboard/recent-sales-chart';
import { DollarSign, ShoppingBag, TrendingUp, Wallet, Clock } from 'lucide-react';
import type { Order, ShopSettings } from '@/lib/types';

export default function AdminDashboard() {
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'));
    }, [firestore]);

    const settingsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'settings', 'shop');
    }, [firestore]);

    const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);
    const { data: settings, isLoading: isLoadingSettings } = useDoc<ShopSettings>(settingsRef);

    const metrics = useMemo(() => {
        if (!orders || !settings) return {
            shiftSales: 0,
            totalSales: 0,
            shiftOrders: 0,
            activeOrders: 0,
            avgTicket: 0,
            topProducts: [],
            recentSales: [],
            recentOrders: []
        };

        const shiftStartTime = settings.shiftStartAt ? settings.shiftStartAt.toDate() : null;

        let shiftSales = 0;
        let shiftOrdersCount = 0;
        let activeOrdersCount = 0;
        let totalRevenue = 0;
        let completedOrdersCount = 0;
        const productSales: Record<string, { name: string, sales: number, revenue: number, imageUrl?: string }> = {};

        const salesByDate: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
            salesByDate[dateStr] = 0;
        }

        orders.forEach(order => {
            const orderDate = order.orderDate.toDate();

            if (['PENDIENTE_PAGO', 'EN_PREPARACION', 'LISTO_REPARTO'].includes(order.status)) {
                activeOrdersCount++;
            }
            
            // Usamos solo pedidos completados para las métricas de ventas
            if (['COMPLETADO'].includes(order.status)) {
                 totalRevenue += order.totalAmount;
                 completedOrdersCount++;

                // Comprobar si el pedido pertenece al turno actual
                if (shiftStartTime && orderDate >= shiftStartTime) {
                    shiftSales += order.totalAmount;
                    shiftOrdersCount++;
                }

                order.items.forEach(item => {
                    if (!productSales[item.productId]) {
                        productSales[item.productId] = {
                            name: item.productName,
                            sales: 0,
                            revenue: 0,
                        };
                    }
                    productSales[item.productId].sales += item.quantity;
                    productSales[item.productId].revenue += (item.unitPrice * item.quantity);
                });

                const diffTime = Math.abs(new Date().getTime() - orderDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 7) {
                    const dateStr = orderDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
                    if (salesByDate[dateStr] !== undefined) {
                        salesByDate[dateStr] += order.totalAmount;
                    }
                }
            }
        });

        const avgTicket = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

        const sortedProducts = Object.entries(productSales)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        const recentSalesData = Object.entries(salesByDate).map(([date, total]) => ({
            date,
            total
        }));

        return {
            shiftSales,
            totalSales: totalRevenue,
            shiftOrders: shiftOrdersCount,
            activeOrders: activeOrdersCount,
            avgTicket,
            topProducts: sortedProducts,
            recentSales: recentSalesData,
            recentOrders: orders.slice(0, 5)
        };
    }, [orders, settings]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (isLoadingOrders || isLoadingSettings) {
        return <div className="flex items-center justify-center h-full py-12">Cargando métricas...</div>;
    }

    return (
        <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title={settings?.isOpen ? "Ventas del Turno Actual" : "Ventas del Último Turno"}
                    value={formatCurrency(metrics.shiftSales)}
                    icon={DollarSign}
                    description={`${metrics.shiftOrders} pedidos este turno`}
                />
                <KPICard
                    title="Pedidos Activos"
                    value={metrics.activeOrders}
                    icon={ShoppingBag}
                    description="Pendientes o en preparación"
                />
                <KPICard
                    title="Ticket Promedio"
                    value={formatCurrency(metrics.avgTicket)}
                    icon={TrendingUp}
                    description="Valor por pedido (histórico)"
                />
                <KPICard
                    title="Ventas Totales"
                    value={formatCurrency(metrics.totalSales)}
                    icon={Wallet}
                    description="Histórico de ventas completadas"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 lg:grid-cols-2">
                <div>
                    <RecentSalesChart data={metrics.recentSales} />
                </div>

                <div>
                    <TopProducts products={metrics.topProducts} />
                </div>
            </div>
        </div>
    );
}

    