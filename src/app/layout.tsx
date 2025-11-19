import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/components/cart-provider';
import { FirebaseClientProvider } from '@/firebase';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'La Perrada de William',
  description: 'Los mejores perros calientes y hamburguesas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Suspense>
          <FirebaseClientProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </FirebaseClientProvider>
        </Suspense>
      </body>
    </html>
  );
}
