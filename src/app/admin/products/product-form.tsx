'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import type { Product, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  category: z.string().min(1, "La categoría es obligatoria."),
});

const imageSchema = z.instanceof(File).optional()
  .refine(file => !file || file.size <= 5 * 1024 * 1024, `El tamaño máximo de la imagen es 5MB.`)
  .refine(file => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), 'Formato de imagen no válido. Solo se aceptan JPG, PNG, o WebP.');


export function ProductForm({ children, productToEdit }: { children: React.ReactNode, productToEdit?: Product }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isPending, startTransition] = useTransition();
    const [errors, setErrors] = useState<Record<string, string[] | undefined> | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);


    const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesRef);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setImageError(null);
        
        if (file) {
            const validation = imageSchema.safeParse(file);
            if (!validation.success) {
                setImageError(validation.error.flatten().formErrors[0]);
                setImageFile(null);
            } else {
                setImageFile(file);
            }
        } else {
            setImageFile(null);
        }
    };
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors(null);
        setImageError(null);

        const formData = new FormData(event.currentTarget);
        const rawData = Object.fromEntries(formData.entries());

        const validatedFields = productSchema.safeParse(rawData);
        if (!validatedFields.success) {
            setErrors(validatedFields.error.flatten().fieldErrors);
            toast({
                variant: 'destructive',
                title: 'Error en el formulario',
                description: 'Por favor, corrige los errores.',
            });
            return;
        }
        
        startTransition(async () => {
            if (!firestore) return;
            const storage = getStorage();

            try {
                let imageUrl = productToEdit?.imageUrl || "";

                if (imageFile) {
                    const storageRef = ref(storage, `product-images/${Date.now()}_${imageFile.name}`);
                    const uploadResult = await uploadBytes(storageRef, imageFile);
                    imageUrl = await getDownloadURL(uploadResult.ref);
                }
                
                const { ...data } = validatedFields.data;
                const id = formData.get('id') as string | null;

                if (id) {
                    const productRef = doc(firestore, 'products', id);
                    await updateDoc(productRef, {
                        ...data,
                        imageUrl,
                    });
                } else {
                    const productsCollection = collection(firestore, 'products');
                    const newProduct = {
                        ...data,
                        imageUrl,
                        imageHint: data.category.toLowerCase()
                    };
                    await addDoc(productsCollection, newProduct);
                }

                toast({
                    title: '¡Éxito!',
                    description: 'Producto guardado con éxito.',
                });
                setOpen(false);
                setImageFile(null);
            } catch (e) {
                console.error("Error saving product:", e);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'No se pudo guardar el producto.',
                });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                setErrors(null);
                setImageError(null);
                setImageFile(null);
            }
        }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{productToEdit ? 'Editar Producto' : 'Añadir Producto'}</DialogTitle>
                    <DialogDescription>
                        {productToEdit ? 'Actualiza los detalles del producto.' : 'Añade un nuevo producto al menú.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    {productToEdit && <input type="hidden" name="id" value={productToEdit.id} />}
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nombre</Label>
                            <Input id="name" name="name" defaultValue={productToEdit?.name} className="col-span-3" />
                            {errors?.name && <p className="col-span-4 text-xs text-destructive text-right">{errors.name[0]}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Descripción</Label>
                            <Textarea id="description" name="description" defaultValue={productToEdit?.description} className="col-span-3" />
                             {errors?.description && <p className="col-span-4 text-xs text-destructive text-right">{errors.description[0]}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Precio</Label>
                            <Input id="price" name="price" type="number" step="0.01" defaultValue={productToEdit?.price} className="col-span-3" />
                             {errors?.price && <p className="col-span-4 text-xs text-destructive text-right">{errors.price[0]}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Categoría</Label>
                             <Select name="category" defaultValue={productToEdit?.category}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder={isLoadingCategories ? "Cargando..." : "Selecciona una categoría"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map(category => (
                                        <SelectItem key={category.id} value={category.name}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors?.category && <p className="col-span-4 text-xs text-destructive text-right">{errors.category[0]}</p>}
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image" className="text-right">Imagen</Label>
                            <Input id="image" name="image" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} className="col-span-3" />
                             {imageError && <p className="col-span-4 text-xs text-destructive text-right">{imageError}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                         <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Guardar Cambios"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
