'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentSalesChartProps {
    data: { date: string; total: number }[];
}

export function RecentSalesChart({ data }: RecentSalesChartProps) {
    return (
        <Card className="border-slate-200 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Ventas Recientes</CardTitle>
                <p className="text-sm text-slate-500">Últimos 7 días</p>
            </CardHeader>
            <CardContent className="pl-2 flex-1">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(226, 232, 240, 0.3)' }}
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']}
                        />
                        <Bar
                            dataKey="total"
                            fill="#0f172a"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
