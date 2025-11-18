'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, ScrollText, Home } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const adminNavLinks = [
    { href: "/admin/orders", label: "Pedidos", icon: ScrollText },
    { href: "/admin/products", label: "Productos", icon: Package },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const pathname = usePathname();

  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] py-8 md:py-12">
        <aside className="hidden w-[200px] flex-col md:flex">
          <nav className="grid items-start gap-2">
            {adminNavLinks.map(link => (
                <Link key={link.href} href={link.href}>
                    <Button 
                        variant={pathname.startsWith(link.href) ? 'default' : 'ghost'} 
                        className="w-full justify-start"
                    >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                    </Button>
                </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
    </div>
  )
}
