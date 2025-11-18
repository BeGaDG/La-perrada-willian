'use client';

// This file is no longer the primary source of data.
// The application now fetches products and orders directly from Firestore.

import type { Order } from './types';

// This data is now fetched from Firestore.
export let orders: Order[] = [];
