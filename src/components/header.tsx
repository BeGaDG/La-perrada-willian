'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from './cart-provider';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          La Perrada de William
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-slate-900 transition-colors">
            Menú
          </Link>
          <Link href="/checkout" className="text-sm font-medium hover:text-slate-900 transition-colors">
            Checkout
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <Button asChild variant="default" size="sm" className="relative bg-slate-900 hover:bg-slate-800">
            <Link href="/checkout">
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Carrito</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container py-4 flex flex-col space-y-3">
            <Link
              href="/"
              className="text-sm font-medium hover:text-slate-900 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Menú
            </Link>
            <Link
              href="/checkout"
              className="text-sm font-medium hover:text-slate-900 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Checkout
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
