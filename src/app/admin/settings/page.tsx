'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, type FieldValue } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import type { ShopSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const settingsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'settings', 'shop');
    }, [firestore]);

    const { data: settings, isLoading } = useDoc<ShopSettings>(settingsRef);
    
    // El estado por defecto es 'cerrado' hasta que se carguen los datos
    const isShopOpen = settings?.isOpen ?? false;

    const handleToggleShop = async (isOpen: boolean) => {
        if (!settingsRef) return;
        try {
            const updateData: { isOpen: boolean; shiftStartAt?: FieldValue } = { isOpen };
            if (isOpen) {
                // Si estamos abriendo la tienda, guardamos la hora de inicio del turno.
                updateData.shiftStartAt = serverTimestamp();
            }

            // Usamos setDoc con merge para crear el documento si no existe
            await setDoc(settingsRef, updateData, { merge: true });
            
            toast({
                title: 'Estado de la tienda actualizado',
                description: `La tienda ahora está ${isOpen ? 'abierta' : 'cerrada'}.`,
            });
        } catch (error) {
            console.error('Error updating shop status:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo actualizar el estado de la tienda.',
            });
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 font-headline">Ajustes de la Tienda</h1>
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Estado de la Tienda</CardTitle>
                    <CardDescription>
                        Activa o desactiva la capacidad de los clientes para realizar pedidos. Al abrir, se iniciará un nuevo turno de ventas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-6 w-12" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Switch
                                id="shop-status-toggle"
                                checked={isShopOpen}
                                onCheckedChange={handleToggleShop}
                                aria-label="Activar o desactivar la tienda"
                            />
                            <Label htmlFor="shop-status-toggle" className="cursor-pointer">
                                {isShopOpen ? 'Tienda Abierta - Aceptando pedidos' : 'Tienda Cerrada - No se aceptan pedidos'}
                            </Label>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    