'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
  const router = useRouter();
  return (
    <div className="container py-12 md:py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Página no disponible</h1>
      <p className="text-muted-foreground mb-6">Esta sección ha sido eliminada.</p>
      <Button onClick={() => router.push('/')}>Volver al Inicio</Button>
    </div>
  );
}
