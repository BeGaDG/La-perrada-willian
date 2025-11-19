import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
}

export function KPICard({ title, value, description, icon: Icon, trend, trendUp }: KPICardProps) {
    return (
        <Card className="border-slate-200">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500 mb-1">
                            {title}
                        </p>
                        <h3 className="text-2xl font-bold text-slate-900">
                            {value}
                        </h3>
                        {(description || trend) && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                {trend && (
                                    <span className={cn(
                                        "text-xs font-medium",
                                        trendUp ? "text-green-600" : "text-red-600"
                                    )}>
                                        {trend}
                                    </span>
                                )}
                                {description && (
                                    <p className="text-xs text-slate-500">{description}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-slate-600" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
