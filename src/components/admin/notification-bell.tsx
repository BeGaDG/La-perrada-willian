import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { collection, query, where } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Order } from "@/lib/types";

export function NotificationBell() {
    const firestore = useFirestore();
    const router = useRouter();

    // 1. Listen for new orders in real-time
    const newOrdersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), where('status', '==', 'PENDIENTE_PAGO'));
    }, [firestore]);
    const { data: newOrders } = useCollection<Order>(newOrdersQuery);

    const [permission, setPermission] = useState('default');
    const { toast } = useToast();

    useEffect(() => {
        // Only run on client
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = () => {
        if (!('Notification' in window)) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Este navegador no soporta notificaciones de escritorio.',
            });
            return;
        }

        Notification.requestPermission().then((perm) => {
            setPermission(perm);
            if (perm === 'granted') {
                toast({
                    title: '¡Permiso concedido!',
                    description: 'Recibirás notificaciones de nuevos pedidos.',
                });
                new Notification('Notificaciones Activadas', {
                    body: '¡Todo listo para recibir pedidos!',
                    icon: '/favicon.ico',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Permiso denegado',
                    description: 'No recibirás notificaciones. Puedes cambiarlo en la configuración de tu navegador.',
                });
            }
        });
    };

    const hasNewOrders = newOrders && newOrders.length > 0;
    const requiresPermission = permission !== 'granted';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" onClick={() => { if (hasNewOrders) router.push('/admin/orders') }}>
                    <Bell className="h-5 w-5" />
                    {(hasNewOrders || requiresPermission) && (
                        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center">
                            {hasNewOrders ? (
                                <Badge variant="destructive" className="absolute -top-1 -right-2 h-5 w-5 justify-center p-0">{newOrders.length}</Badge>
                            ) : requiresPermission ? (
                                <>
                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75 top-1 right-1"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 top-1 right-1"></span>
                                </>
                            ) : null}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                    {hasNewOrders ? `Tienes ${newOrders.length} pedido${newOrders.length > 1 ? 's' : ''} nuevo${newOrders.length > 1 ? 's' : ''}` : 'No hay pedidos nuevos'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {requiresPermission ? (
                    <DropdownMenuItem onSelect={requestPermission}>
                        Activar Notificaciones de Escritorio
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem disabled>
                        Las notificaciones están activas
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => router.push('/admin/orders')}>
                    Ver todos los pedidos
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
