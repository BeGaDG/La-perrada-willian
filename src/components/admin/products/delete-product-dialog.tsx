import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";

export function DeleteProductDialog({ productId }: { productId: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleDelete = async () => {
        if (!firestore) return;
        try {
            const productRef = doc(firestore, 'products', productId);
            await deleteDoc(productRef);
            toast({
                title: 'Producto eliminado',
                description: 'El producto ha sido eliminado con éxito.'
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: 'Error',
                description: 'No se pudo eliminar el producto.',
            });
            console.error("Error deleting product: ", error);
        } finally {
            setIsAlertOpen(false);
        }
    };

    return (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                    Eliminar
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el producto de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Sí, eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
