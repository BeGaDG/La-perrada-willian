'use client';

import React, { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveProduct, type FormState } from './product-actions';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const initialState: FormState = { message: '', success: false };

function SubmitButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar Cambios"}</Button>;
}

export function ProductForm({ children, productToEdit }: { children: React.ReactNode, productToEdit?: Product }) {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useFormState(saveProduct, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.success) {
            toast({
                title: "¡Éxito!",
                description: state.message,
            });
            setOpen(false);
        } else if (state.message && state.errors) {
            toast({
                variant: 'destructive',
                title: 'Error en el formulario',
                description: state.message,
            });
        }
    }, [state, toast]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{productToEdit ? 'Editar Producto' : 'Añadir Producto'}</DialogTitle>
                    <DialogDescription>
                        {productToEdit ? 'Actualiza los detalles del producto.' : 'Añade un nuevo producto al menú.'}
                    </DailogDescription>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="id" value={productToEdit?.id} />
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nombre</Label>
                            <Input id="name" name="name" defaultValue={productToEdit?.name} className="col-span-3" />
                            {state?.errors?.name && <p className="col-span-4 text-xs text-destructive text-right">{state.errors.name[0]}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Descripción</Label>
                            <Textarea id="description" name="description" defaultValue={productToEdit?.description} className="col-span-3" />
                             {state?.errors?.description && <p className="col-span-4 text-xs text-destructive text-right">{state.errors.description[0]}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Precio</Label>
                            <Input id="price" name="price" type="number" step="0.01" defaultValue={productToEdit?.price} className="col-span-3" />
                             {state?.errors?.price && <p className="col-span-4 text-xs text-destructive text-right">{state.errors.price[0]}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Categoría</Label>
                            <Select name="category" defaultValue={productToEdit?.category}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Perros Calientes">Perros Calientes</SelectItem>
                                    <SelectItem value="Hamburguesas">Hamburguesas</SelectItem>
                                    <SelectItem value="Bebidas">Bebidas</SelectItem>
                                    <SelectItem value="Otros">Otros</SelectItem>
                                </SelectContent>
                            </Select>
                            {state?.errors?.category && <p className="col-span-4 text-xs text-destructive text-right">{state.errors.category[0]}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
