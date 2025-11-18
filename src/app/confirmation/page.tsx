'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle } from "lucide-react";

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const paymentMethod = searchParams.get('paymentMethod');

    return (
        <div className="container py-12 md:py-24 flex items-center justify-center">
            <Card className="w-full max-w-lg text-center p-6">
                <CardHeader>
                    <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold mt-4">¡Tu pedido ha sido enviado!</CardTitle>
                    <CardDescription className="text-muted-foreground">Gracias por tu compra.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {paymentMethod === 'TRANSFERENCIA' ? (
                        <div>
                             <p className="mb-4">Para completar tu pedido, por favor realiza la transferencia a una de las siguientes cuentas y envía el comprobante a nuestro WhatsApp.</p>
                             <div className="text-left space-y-3 p-4 bg-muted rounded-md">
                                <div>
                                    <p className="font-semibold">Bancolombia Ahorros:</p>
                                    <p>569-1234567-89</p>
                                </div>
                                 <div>
                                    <p className="font-semibold">Nequi:</p>
                                    <p>316-123-4567</p>
                                </div>
                             </div>
                        </div>
                    ) : (
                         <p>Prepara tu efectivo. Nuestro domiciliario te cobrará al momento de la entrega. ¡Gracias por tu compra!</p>
                    )}
                     <Button onClick={() => router.push('/')} className="w-full mt-4">Volver al Inicio</Button>
                </CardContent>
            </Card>
        </div>
    )
}


export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ConfirmationContent />
        </Suspense>
    )
}
