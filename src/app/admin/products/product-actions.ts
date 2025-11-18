'use server';

import { z } from 'zod';
import { products } from '@/lib/data';
import { revalidatePath } from 'next/cache';

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

    try {
        if (id) {
            // Update product
            const index = products.findIndex(p => p.id === id);
            if (index > -1) {
                products[index] = { ...products[index], ...data };
            }
        } else {
            // Create new product
            const newProduct = {
                ...data,
                id: `prod-${Date.now()}`,
                imageUrl: 'https://picsum.photos/seed/new/600/400',
                imageHint: 'food placeholder'
            };
            products.push(newProduct);
        }

        revalidatePath('/admin/products');
        revalidatePath('/');
        return { message: 'Producto guardado con éxito.', success: true };
    } catch (e) {
        return { message: 'Error al guardar el producto.', success: false };
    }
}
