'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { KPICard } from '@/components/admin/dashboard/kpi-card';
import { TopProducts } from '@/components/admin/dashboard/top-products';
import { RecentSalesChart } from '@/components/admin/dashboard/recent-sales-chart';
import { DollarSign, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import type { Order } from '@/lib/types';

export default function AdminDashboard() {
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'));
    }, [firestore]);

    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

    const metrics = useMemo(() => {
        if (!orders) return {
            todaySales: 0,
            totalSales: 0,
            todayOrders: 0,
            activeOrders: 0,
            avgTicket: 0,
            topProducts: [],
            recentSales: [],
            recentOrders: []
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let todaySales = 0;
        let todayOrdersCount = 0;
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
            // @ts-ignore
            const orderDate = order.orderDate instanceof Timestamp ? order.orderDate.toDate() : new Date(order.orderDate);
            const isToday = orderDate >= today;

            if (['PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO', 'PENDIENTE_PAGO'].includes(order.status)) {
                activeOrdersCount++;
            }

            if (['ENTREGADO', 'PAGADO', 'COMPLETADO'].includes(order.status)) {
                totalRevenue += order.totalAmount;
                completedOrdersCount++;

                if (isToday) {
                    todaySales += order.totalAmount;
                    todayOrdersCount++;
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
            todaySales,
            totalSales: totalRevenue,
            todayOrders: todayOrdersCount,
            activeOrders: activeOrdersCount,
            avgTicket,
            topProducts: sortedProducts,
            recentSales: recentSalesData,
            recentOrders: orders.slice(0, 5)
        };
    }, [orders]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full py-12">Cargando métricas...</div>;
    }

    return (
        <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Ventas de Hoy"
                    value={formatCurrency(metrics.todaySales)}
                    icon={DollarSign}
                    description={`${metrics.todayOrders} pedidos`}
                />
                <KPICard
                    title="Pedidos Activos"
                    value={metrics.activeOrders}
                    icon={ShoppingBag}
                    description="En proceso"
                    trend={metrics.activeOrders > 0 ? "Activos" : "Limpio"}
                    trendUp={metrics.activeOrders === 0}
                />
                <KPICard
                    title="Ticket Promedio"
                    value={formatCurrency(metrics.avgTicket)}
                    icon={TrendingUp}
                    description="Por pedido"
                />
                <KPICard
                    title="Ventas Totales"
                    value={formatCurrency(metrics.totalSales)}
                    icon={Wallet}
                    description="Histórico"
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
