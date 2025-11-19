'use client';

import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface ShopStatusIndicatorProps {
    isOpen: boolean;
    isLoading: boolean;
}

export function ShopStatusIndicator({ isOpen, isLoading }: ShopStatusIndicatorProps) {
    if (isLoading) {
        return <Skeleton className="h-6 w-28 rounded-full" />
    }

    return (
        <div className="flex items-center gap-2">
            <span className={cn(
                "h-2.5 w-2.5 rounded-full animate-pulse",
                isOpen ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-sm font-medium">
                {isOpen ? "Tienda Abierta" : "Tienda Cerrada"}
            </span>
        </div>
    )
}