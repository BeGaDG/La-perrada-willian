import { z } from 'genkit';

export const GenerateProductImageInputSchema = z.object({
  productName: z.string().describe('El nombre del producto para el cual generar una imagen.'),
});
export type GenerateProductImageInput = z.infer<typeof GenerateProductImageInputSchema>;

export const GenerateProductImageOutputSchema = z.object({
  imageUrl: z.string().describe('La URL de la imagen generada, como un data URI.'),
});
export type GenerateProductImageOutput = z.infer<typeof GenerateProductImageOutputSchema>;
