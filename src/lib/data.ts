'use client';

// This file is no longer the primary source of data for products.
// It can be kept for reference or removed. The application now fetches
// products and orders directly from Firestore.
// The 'orders' array is also no longer used on the frontend, but is left
// for historical reference.

import type { Order } from './types';

// Orders are now fetched from Firestore.
export let orders: Order[] = [];
