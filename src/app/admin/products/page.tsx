'use client';

import { useMemo, useState } from "react";
import { collection, doc, deleteDoc, writeBatch, getDocs } from "firebase/firestore";
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
import { MoreHorizontal, PlusCircle, Upload, ImageIcon, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image";
import { ProductForm } from "./product-form";
import type { Product, Category } from "@/lib/types";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


function DeleteProductDialog({ productId }: { productId: string }) {
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

function SeedDatabaseButton() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleSeed = async () => {
    if (!firestore) return;
    setIsLoading(true);
    setIsAlertOpen(false);

    try {
      const batch = writeBatch(firestore);
      
      const productsSnapshot = await getDocs(collection(firestore, "products"));
      productsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      const categoriesSnapshot = await getDocs(collection(firestore, "categories"));
      categoriesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      const categoriesCollection = collection(firestore, "categories");
      const categoryMap: Record<string, string> = {};

      for (const categoryName of menuData.categories) {
        const docRef = doc(categoriesCollection);
        batch.set(docRef, { name: categoryName });
        categoryMap[categoryName] = categoryName;
      }

      const productsRef = collection(firestore, 'products');
      menuData.products.forEach(product => {
        const docRef = doc(productsRef);
        batch.set(docRef, {
          ...product,
          price: product.price || 0,
          description: `Un delicioso ${product.name}`,
          imageUrl: "", 
          imageHint: product.imageHint || product.name,
          category: categoryMap[product.category] || product.category
        });
      });

      await batch.commit();

      toast({
        title: '¡Base de datos reiniciada!',
        description: 'Todos los productos y categorías han sido eliminados y reemplazados con los datos de muestra.'
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Error al reiniciar la base de datos',
        description: 'No se pudieron procesar los cambios. Revisa la consola para más detalles.',
      });
      console.error("Error seeding database: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? 'Cargando...' : 'Cargar Menú de Muestra'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Reiniciar la base de datos?</AlertDialogTitle>
          <AlertDialogDescription>
            ¡Atención! Esta acción eliminará TODOS los productos y categorías existentes en la base de datos y los reemplazará con los del archivo de muestra. Es ideal para empezar de cero.
            ¿Deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSeed}>
            Sí, reiniciar y cargar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

export default function AdminProductsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const productsRef = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection<Product>(productsRef);

  const categoriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesRef);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => {
      const matchesSearchTerm = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearchTerm && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-3xl font-bold font-headline">Gestión de Productos</h1>
            <div className="flex gap-2 items-center">
              <ProductForm>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Producto
                </Button>
              </ProductForm>
              <SeedDatabaseButton />
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nombre..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCategories ? "Cargando..." : "Filtrar por categoría"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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
            {(isLoadingProducts || isLoadingCategories) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">Cargando productos...</TableCell>
              </TableRow>
            )}
            {!(isLoadingProducts || isLoadingCategories) && filteredProducts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      {products && products.length > 0 ? "No se encontraron productos con los filtros aplicados." : "No hay productos. ¡Carga el menú de muestra o añade uno nuevo!"}
                    </TableCell>
                </TableRow>
            )}
            {filteredProducts?.map((product) => (
              <TableRow key={product.id}>
                 <TableCell className="hidden sm:table-cell">
                    {product.imageUrl ? (
                        <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={product.imageUrl}
                            width="64"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-sm truncate">
                  {product.description}
                </TableCell>
                <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
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
