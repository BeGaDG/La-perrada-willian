'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Package, ScrollText, LogOut, Tags, LayoutDashboard, Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser, useAuth } from "@/firebase"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleSignOut = async () => {
        if (!auth) return;
        await auth.signOut();
        router.push('/login');
    }

    if (isUserLoading || !user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Cargando...</p>
            </div>
        );
    }

    const navItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
        { href: "/admin/orders", icon: ScrollText, label: "Pedidos" },
        { href: "/admin/products", icon: Package, label: "Productos" },
        { href: "/admin/categories", icon: Tags, label: "Categorías" },
    ];

    const NavLinks = () => (
        <>
            {navItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
                                ? "bg-slate-900 text-white"
                                : "text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                );
            })}
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-white">
                <div className="flex h-16 items-center justify-between px-4">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b">
                                    <h2 className="font-bold text-lg">La Perrada</h2>
                                </div>
                                <nav className="flex-1 p-4 space-y-2">
                                    <NavLinks />
                                </nav>
                                <div className="p-4 border-t">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Cerrar Sesión
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <h1 className="font-bold text-lg">Dashboard</h1>

                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </Button>
                </div>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex flex-col w-64 border-r bg-white h-screen sticky top-0">
                    <div className="p-6 border-b">
                        <h2 className="font-bold text-xl">La Perrada</h2>
                        <p className="text-sm text-slate-500">Admin Panel</p>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        <NavLinks />
                    </nav>

                    <div className="p-4 border-t">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleSignOut}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Desktop Header */}
                    <header className="hidden lg:block sticky top-0 z-40 border-b bg-white">
                        <div className="flex h-16 items-center justify-between px-6">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar..."
                                        className="pl-9 bg-slate-50 border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </Button>
                            </div>
                        </div>
                    </header>

                    <main className="p-4 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
