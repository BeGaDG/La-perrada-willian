'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";
import type { Order } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

interface RecentOrdersTableProps {
    orders: Order[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (date: Date | Timestamp) => {
        const d = date instanceof Timestamp ? date.toDate() : new Date(date);
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'COMPLETADO':
                return { color: 'bg-green-500/10 text-green-700 border-green-500/20', label: 'Completado' };
            case 'PENDIENTE_PAGO':
                return { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', label: 'Pendiente Pago' };
            case 'EN_PREPARACION':
                return { color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', label: 'En Preparación' };
            case 'LISTO_REPARTO':
                return { color: 'bg-purple-500/10 text-purple-700 border-purple-500/20', label: 'Listo Reparto' };
            case 'CANCELADO':
                return { color: 'bg-red-500/10 text-red-700 border-red-500/20', label: 'Cancelado' };
            default:
                return { color: 'bg-slate-500/10 text-slate-700 border-slate-500/20', label: status };
        }
    };

    return (
        <Card className="h-full border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold">Pedidos Recientes</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">Últimas órdenes</p>
                </div>
                <Button asChild size="sm" variant="outline" className="gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300">
                    <Link href="/admin/orders">
                        Ver todos
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <TableHead className="font-semibold">ID</TableHead>
                                <TableHead className="font-semibold">Cliente</TableHead>
                                <TableHead className="font-semibold">Estado</TableHead>
                                <TableHead className="text-right font-semibold">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-slate-500 py-12">
                                        <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                        <p>No hay pedidos recientes</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => {
                                    const statusConfig = getStatusConfig(order.status);
                                    return (
                                        <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <TableCell className="font-mono text-sm font-medium">#{order.id.slice(-4)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{order.customerName}</span>
                                                    <span className="text-xs text-slate-500">{formatDate(order.orderDate)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${statusConfig.color} border font-medium`} variant="outline">
                                                    {statusConfig.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {formatCurrency(order.totalAmount)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
