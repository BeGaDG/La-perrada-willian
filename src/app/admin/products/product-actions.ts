'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getSdks } from '@/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  category: z.enum(['Perros Calientes', 'Hamburguesas', 'Bebidas', 'Otros']),
});

export type FormState = {
    message: string;
    errors?: Record<string, string[] | undefined>;
    success: boolean;
};

export async function saveProduct(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = productSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Por favor, corrige los errores del formulario.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { id, ...data } = validatedFields.data;
    const { firestore } = getSdks();

    try {
        if (id) {
            // Update product
            const productRef = doc(firestore, 'products', id);
            await updateDoc(productRef, data);
        } else {
            // Create new product
            const productsCollection = collection(firestore, 'products');
            const newProduct = {
                ...data,
                imageUrl: 'https://picsum.photos/seed/newproduct/600/400',
                imageHint: 'food placeholder'
            };
            await addDoc(productsCollection, newProduct);
        }

        revalidatePath('/admin/products');
        revalidatePath('/');
        return { message: 'Producto guardado con éxito.', success: true };
    } catch (e) {
        console.error("Error saving product:", e);
        return { message: 'Error al guardar el producto.', success: false };
    }
}


export async function deleteProduct(productId: string) {
    if (!productId) {
        throw new Error("Product ID is required for deletion.");
    }

    const { firestore } = getSdks();
    const productRef = doc(firestore, 'products', productId);

    try {
        await deleteDoc(productRef);
        console.log(`Product ${productId} deleted successfully.`);
        
        revalidatePath('/admin/products');
        revalidatePath('/');
    } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("Could not delete product.");
    }
}
