'use client';

import { useMemo, useState } from "react";
import { collection, doc, deleteDoc, writeBatch } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image";
import { ProductForm } from "./product-form";
import type { Product } from "@/lib/types";
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
import { useToast } from "@/hooks/use-toast";
import menuData from '@/lib/menu-data.json';


function DeleteProductDialog({ productId }: { productId: string }) {
  const firestore = useFirestore();
  const { toast } = useToast();

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
    }
  };

  return (
    <AlertDialog>
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

function SeedDatabaseButton() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSeed = async () => {
    if (!firestore) return;
    setIsLoading(true);

    try {
      const batch = writeBatch(firestore);
      
      // Seed Categories
      const categoriesCollection = collection(firestore, "categories");
      const categoryMap: Record<string, string> = {};

      for (const categoryName of menuData.categories) {
        const docRef = doc(categoriesCollection);
        batch.set(docRef, { name: categoryName });
        categoryMap[categoryName] = categoryName; // In this app category name is the ID for relations
      }

      // Seed Products
      const productsRef = collection(firestore, 'products');
      menuData.products.forEach(product => {
        const docRef = doc(productsRef);
        batch.set(docRef, {
          ...product,
          price: product.price || 0,
          description: product.description || `Un delicioso ${product.name}`,
          imageUrl: `https://picsum.photos/seed/${product.name.replace(/\s/g, '')}/600/400`,
          imageHint: product.category.toLowerCase(),
          category: categoryMap[product.category] || product.category
        });
      });

      await batch.commit();

      toast({
        title: '¡Menú cargado!',
        description: 'Todos los productos y categorías han sido añadidos a la base de datos.'
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Error al cargar el menú',
        description: 'No se pudieron añadir los productos. Revisa la consola para más detalles.',
      });
      console.error("Error seeding database: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
     <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? 'Cargando...' : 'Cargar Menú de Muestra'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cargar el menú de muestra?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción añadirá todas las categorías y productos del archivo de muestra a tu base de datos.
            No eliminará los productos existentes. ¿Deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSeed}>
            Sí, cargar menú
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    )
}


export default function AdminProductsPage() {
  const firestore = useFirestore();
  const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, isLoading } = useCollection<Product>(productsRef);

  return (
    <div>
        <div className="flex items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold font-headline">Gestión de Productos</h1>
            <div className="flex gap-2">
              <SeedDatabaseButton />
              <ProductForm>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Producto
                </Button>
              </ProductForm>
            </div>
        </div>
       <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Imagen</span>
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="hidden md:table-cell">Descripción</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Cargando productos...</TableCell>
              </TableRow>
            )}
            {!isLoading && products?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">No se encontraron productos. ¡Carga el menú de muestra o añade uno nuevo!</TableCell>
                </TableRow>
            )}
            {products?.map((product) => (
              <TableRow key={product.id}>
                 <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={product.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={product.imageUrl}
                    width="64"
                    data-ai-hint={product.imageHint}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-sm truncate">
                  {product.description}
                </TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <ProductForm productToEdit={product}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar</DropdownMenuItem>
                      </ProductForm>
                       <DeleteProductDialog productId={product.id} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
       </div>
    </div>
  );
}
