'use client';

import { initializeFirebase, getSdks } from './init';

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// Re-export initializeFirebase and getSdks for client-side usage if needed,
// though direct use in components is better handled by providers/hooks.
export { initializeFirebase, getSdks };
