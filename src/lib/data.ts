// This file is no longer the primary source of data for products.
// It can be kept for reference or removed. The application now fetches
// products and orders directly from Firestore.
// The 'orders' array is also no longer used on the frontend, but is left
// for historical reference.

import type { Product, Order } from './types';

// Products are now fetched from Firestore. This is just a backup/example.
export const products: Product[] = [
  {
    id: 'hotdog-clasico',
    name: 'Perro Clásico',
    description: 'Salchicha, pan fresco, papas trituradas y nuestras salsas caseras.',
    price: 8000,
    category: 'Perros Calientes',
    imageUrl: 'https://picsum.photos/seed/hotdog1/600/400',
    imageHint: 'hot dog'
  },
];

// Orders are now fetched from Firestore.
export let orders: Order[] = [];
