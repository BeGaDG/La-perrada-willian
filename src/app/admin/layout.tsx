'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Package, ScrollText, Home, LogOut, Tags, Bell } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useUser, useAuth } from "@/firebase"
import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


function NotificationBell() {
    const [permission, setPermission] = useState('default');
    const { toast } = useToast();

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = () => {
        if (!('Notification' in window)) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Este navegador no soporta notificaciones de escritorio.',
            });
            return;
        }

        Notification.requestPermission().then((perm) => {
            setPermission(perm);
            if (perm === 'granted') {
                toast({
                    title: '¡Permiso concedido!',
                    description: 'Recibirás notificaciones de nuevos pedidos.',
                });
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Permiso denegado',
                    description: 'No recibirás notificaciones. Puedes cambiarlo en la configuración de tu navegador.',
                });
            }
        });
    };

    const sendTestNotification = () => {
        if (permission === 'granted') {
            new Notification('Notificación de Prueba', {
                body: '¡Las notificaciones están funcionando correctamente!',
                icon: '/favicon.ico',
            });
        } else {
            requestPermission();
        }
    };
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {permission !== 'granted' && (
                        <span className="absolute top-2 right-2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                 </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {permission !== 'granted' ? (
                     <DropdownMenuItem onSelect={requestPermission}>
                        Activar Notificaciones
                    </DropdownMenuItem>
                ) : (
                    <>
                        <DropdownMenuItem disabled>Permiso Concedido</DropdownMenuItem>
                        <DropdownMenuItem onSelect={sendTestNotification}>
                            Enviar Notificación de Prueba
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const pathname = usePathname();
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();

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

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
         <nav className="flex flex-col gap-2 p-4">
             <Link href="/" className="flex items-center gap-2 font-semibold mb-4">
                <span className="">La Perrada de William</span>
            </Link>
            <Button 
                variant={pathname.startsWith("/admin/orders") ? 'default' : 'ghost'} 
                className="w-full justify-start"
                asChild
            >
                <Link href="/admin/orders">
                    <ScrollText className="mr-2 h-4 w-4" />
                    Pedidos
                </Link>
            </Button>
             <Button 
                variant={pathname.startsWith("/admin/products") ? 'default' : 'ghost'} 
                className="w-full justify-start"
                asChild
            >
                <Link href="/admin/products">
                    <Package className="mr-2 h-4 w-4" />
                    Productos
                </Link>
            </Button>
             <Button 
                variant={pathname.startsWith("/admin/categories") ? 'default' : 'ghost'} 
                className="w-full justify-start"
                asChild
            >
                <Link href="/admin/categories">
                    <Tags className="mr-2 h-4 w-4" />
                    Categorías
                </Link>
            </Button>
          </nav>
          <div className="mt-auto p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
            </Button>
          </div>
       </aside>
       <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="ml-auto flex items-center gap-2">
                <NotificationBell />
            </div>
        </header>
         <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
       </div>
    </div>
  )
}
