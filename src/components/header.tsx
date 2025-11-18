'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Menu, ScrollText, Shield, ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { CartSheet } from './cart-sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const allNavLinks = [
  { href: '/my-orders', label: 'Mis Pedidos', icon: ScrollText, admin: false },
  { href: '/admin/orders', label: 'Admin', icon: Shield, admin: true },
];

export function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith('/admin');

  const navLinks = allNavLinks.filter(link => {
    if (isAdminPage) {
      return link.admin; // Mostrar solo links de admin
    }
    // En el modo no-admin, podríamos querer mostrar algunos links de admin o no,
    // por ahora, mostramos todos los que no son exclusivamente de admin.
    // O mejor, mostramos los que no son de admin, y el que lleva al admin.
    return true; // Simplificamos: en paginas publicas se muestran todos. El admin layout tiene su propio nav.
  }).filter(link => {
      // Si estamos en modo admin, no mostramos "Mis pedidos"
      if (isAdminPage && link.href === '/my-orders') return false;
      return true;
  });


  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <Logo />
          <nav className="hidden md:flex items-center space-x-6 ml-auto text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname.startsWith(link.href) ? "text-primary" : "text-foreground/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center ml-auto md:ml-6">
            {!isAdminPage && (
              <Button variant="ghost" className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Ver carrito</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t animate-in fade-in-20 slide-in-from-top-4">
            <nav className="container flex flex-col space-y-2 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md p-2 hover:bg-accent",
                    pathname.startsWith(link.href) ? "bg-accent" : ""
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      {!isAdminPage && <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />}
    </>
  );
}
