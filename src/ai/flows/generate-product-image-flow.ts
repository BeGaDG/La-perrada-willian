'use server';
/**
 * @fileOverview Flujo de Genkit para generar una imagen de producto usando IA.
 *
 * - generateProductImage: Función principal que invoca el flujo.
 */

import { ai } from '@/ai/genkit';
import { 
  GenerateProductImageInputSchema, 
  GenerateProductImageOutputSchema,
  type GenerateProductImageInput,
  type GenerateProductImageOutput
} from './product-image-schemas';

export async function generateProductImage(input: GenerateProductImageInput): Promise<GenerateProductImageOutput> {
  return generateProductImageFlow(input);
}

const generateProductImageFlow = ai.defineFlow(
  {
    name: 'generateProductImageFlow',
    inputSchema: GenerateProductImageInputSchema,
    outputSchema: GenerateProductImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Una fotografía de comida profesional y apetitosa de un "${input.productName}" de "La Perrada de William". La imagen debe ser de alta calidad, bien iluminada, sobre un fondo blanco y limpio. Estilo fotorealista.`,
        config: {
            aspectRatio: '3:2',
        }
    });

    if (!media.url) {
        throw new Error('La generación de imagen no devolvió una URL.');
    }

    return {
        imageUrl: media.url
    };
  }
);
