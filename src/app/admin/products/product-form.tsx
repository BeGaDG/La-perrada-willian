'use client';

import React, { useState, useTransition, useCallback } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import type { Product, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { uploadFile } from '@/lib/cloudinary/actions';


const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  category: z.string().min(1, "La categoría es obligatoria."),
  imageUrl: z.string().url("Debe ser una URL válida.").or(z.literal("")),
});


function ImageUploader({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                const result = await uploadFile(base64data, 'products');

                if (result.success && result.url) {
                    onValueChange(result.url);
                    toast({ title: "Imagen subida", description: "La imagen se ha subido con éxito." });
                } else {
                    throw new Error(result.error || 'Upload failed');
                }
                 setIsUploading(false);
            };
            reader.onerror = () => {
                setIsUploading(false);
                throw new Error("Failed to read file");
            }
            reader.readAsDataURL(file);
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({ variant: "destructive", title: "Error de Subida", description: error.message || "No se pudo subir la imagen." });
            setIsUploading(false);
        }
    };

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isUploading) return;
        
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileChange({ target: { files: [file] } } as any);
        }
    }, [isUploading]);

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }
    
    return (
        <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Imagen</Label>
            <div className="col-span-3">
                {value ? (
                    <div className="relative">
                        <Image src={value} alt="Preview" width={100} height={100} className="rounded-md border aspect-video object-cover" />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => onValueChange('')}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div 
                        className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground mt-2">Subiendo...</p>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mt-2">Arrastra o haz clic para subir</p>
                                <Input 
                                    id="file-upload" 
                                    type="file" 
                                    className="absolute w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange} 
                                    accept="image/*"
                                    disabled={isUploading}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export function ProductForm({ children, productToEdit }: { children: React.ReactNode, productToEdit?: Product }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isPending, startTransition] = useTransition();
    const [errors, setErrors] = useState<Record<string, string[] | undefined> | null>(null);
    const [imageUrl, setImageUrl] = useState(productToEdit?.imageUrl || '');

    const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
    const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesRef);

    React.useEffect(() => {
        if (productToEdit?.imageUrl) {
            setImageUrl(productToEdit.imageUrl);
        }
        if (!open) {
            setImageUrl('');
        }
    }, [productToEdit, open]);
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors(null);

        const formData = new FormData(event.currentTarget);
        const rawData = Object.fromEntries(formData.entries());
        rawData.imageUrl = imageUrl;

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

            try {
                const { ...data } = validatedFields.data;
                const id = formData.get('id') as string | null;

                if (id) {
                    const productRef = doc(firestore, 'products', id);
                    await updateDoc(productRef, data);
                } else {
                    const productsCollection = collection(firestore, 'products');
                    const newProduct = {
                        ...data,
                        description: data.description || '',
                        imageHint: data.name.toLowerCase().split(' ').slice(0,2).join(' ') || data.category.toLowerCase()
                    };
                    await addDoc(productsCollection, newProduct);
                }

                toast({
                    title: '¡Éxito!',
                    description: 'Producto guardado con éxito.',
                });
                setOpen(false);
                setImageUrl('');
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
            }
        }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{productToEdit ? 'Editar Producto' : 'Añadir Producto'}</DialogTitle>
                    <DialogDescription>
                        {productToEdit ? 'Actualiza los detalles del producto.' : 'Añade un nuevo producto al menú. Sube una imagen desde tu dispositivo.'}
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
                            <Input id="price" name="price" type="number" step="1" defaultValue={productToEdit?.price} className="col-span-3" />
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
                        <ImageUploader value={imageUrl} onValueChange={setImageUrl} />
                         {errors?.imageUrl && <p className="col-span-4 text-xs text-destructive text-right -mt-2">{errors.imageUrl[0]}</p>}
                    </div>
                    <DialogFooter>
                         <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Guardar Cambios"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
