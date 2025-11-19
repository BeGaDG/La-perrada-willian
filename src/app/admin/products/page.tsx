'use client';

import { useMemo, useState } from "react";
import { collection } from "firebase/firestore";
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
import { MoreHorizontal, PlusCircle, ImageIcon, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteProductDialog } from "@/components/admin/products/delete-product-dialog";


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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;


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

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredProducts, currentPage]);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold font-headline">Gestión de Productos</h1>
        <ProductForm>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Producto
          </Button>
        </ProductForm>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => {
              setCategoryFilter(value)
              setCurrentPage(1);
            }}>
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
            {!(isLoadingProducts || isLoadingCategories) && paginatedProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  {products && products.length > 0 ? "No se encontraron productos con los filtros aplicados." : "No hay productos. ¡Añade uno nuevo!"}
                </TableCell>
              </TableRow>
            )}
            {paginatedProducts?.map((product) => (
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
