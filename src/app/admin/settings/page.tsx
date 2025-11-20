'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, type FieldValue } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ShopSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AdminSettingsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
    const [pendingAction, setPendingAction] = useState<boolean | null>(null);

    const settingsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'settings', 'shop');
    }, [firestore]);

    const { data: settings, isLoading } = useDoc<ShopSettings>(settingsRef);

    // El estado por defecto es 'cerrado' hasta que se carguen los datos
    const isShopOpen = settings?.isOpen ?? false;

    const handleToggleShop = async (isOpen: boolean) => {
        // Si está intentando cerrar la tienda, mostrar confirmación
        if (!isOpen && isShopOpen) {
            setPendingAction(isOpen);
            setShowCloseConfirmation(true);
            return;
        }

        // Si está abriendo la tienda, proceder directamente
        await executeToggleShop(isOpen);
    };

    const executeToggleShop = async (isOpen: boolean) => {
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

    const handleConfirmClose = async () => {
        setShowCloseConfirmation(false);
        if (pendingAction !== null) {
            await executeToggleShop(pendingAction);
            setPendingAction(null);
        }
    };

    const handleCancelClose = () => {
        setShowCloseConfirmation(false);
        setPendingAction(null);
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

            {/* Diálogo de confirmación para cerrar la tienda */}
            <AlertDialog open={showCloseConfirmation} onOpenChange={setShowCloseConfirmation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-500/10 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                            </div>
                            <AlertDialogTitle className="text-xl">¿Cerrar la tienda?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-base space-y-3 pt-2">
                            <p className="font-medium text-foreground">
                                Al cerrar la tienda se finalizará el turno actual.
                            </p>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                                <p className="flex items-start gap-2">
                                    <span className="text-yellow-600 dark:text-yellow-500 font-bold">•</span>
                                    <span>Los clientes no podrán realizar nuevos pedidos</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-yellow-600 dark:text-yellow-500 font-bold">•</span>
                                    <span>El turno actual se cerrará y las estadísticas se guardarán</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="text-yellow-600 dark:text-yellow-500 font-bold">•</span>
                                    <span>Al volver a abrir, se iniciará un nuevo turno</span>
                                </p>
                            </div>
                            <p className="text-muted-foreground text-sm pt-2">
                                ¿Estás seguro de que quieres cerrar la tienda?
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelClose}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmClose}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                            Sí, cerrar tienda
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}