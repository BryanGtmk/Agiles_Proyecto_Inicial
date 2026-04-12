"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Plus, Eye, Pencil, Package } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Empty } from "@/components/ui/empty"
import { useStore } from "@/lib/store-context"
import { ProductoForm } from "@/components/producto-form"
import { ProductoDetail } from "@/components/producto-detail"
import { type Producto, formatCurrency, isLowStock, isOutOfStock } from "@/lib/mock-data"
import { toast } from "sonner"

export default function ProductosPage() {
  const searchParams = useSearchParams()
  const { productos, addProducto, updateProducto } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [filterStock, setFilterStock] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Check URL for new action
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setIsFormOpen(true)
      setSelectedProducto(null)
      setIsEditing(false)
    }
  }, [searchParams])

  // Filter products
  const filteredProductos = useMemo(() => {
    return productos.filter(p => {
      const matchesSearch = 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.marca.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesEstado = filterEstado === "all" || p.estado === filterEstado
      
      let matchesStock = true
      if (filterStock === "bajo") {
        matchesStock = isLowStock(p.stock) || isOutOfStock(p.stock)
      } else if (filterStock === "sin") {
        matchesStock = isOutOfStock(p.stock)
      } else if (filterStock === "normal") {
        matchesStock = !isLowStock(p.stock) && !isOutOfStock(p.stock)
      }
      
      return matchesSearch && matchesEstado && matchesStock
    })
  }, [productos, searchTerm, filterEstado, filterStock])

  const handleCreateProducto = (data: Partial<Producto>) => {
    addProducto(data as Omit<Producto, "id">)
    setIsFormOpen(false)
    toast.success("Producto registrado exitosamente")
  }

  const handleUpdateProducto = (data: Partial<Producto>) => {
    if (selectedProducto) {
      updateProducto(selectedProducto.id, data)
      setIsFormOpen(false)
      setSelectedProducto(null)
      toast.success("Producto actualizado exitosamente")
    }
  }

  const handleViewProducto = (producto: Producto) => {
    setSelectedProducto(producto)
    setIsDetailOpen(true)
  }

  const handleEditProducto = (producto: Producto) => {
    setSelectedProducto(producto)
    setIsEditing(true)
    setIsDetailOpen(false)
    setIsFormOpen(true)
  }

  const handleNewProducto = () => {
    setSelectedProducto(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const getStockBadge = (producto: Producto) => {
    if (isOutOfStock(producto.stock)) {
      return <Badge variant="destructive">Sin stock</Badge>
    }
    if (isLowStock(producto.stock)) {
      return <Badge className="bg-amber-100 text-amber-800">Stock bajo ({producto.stock})</Badge>
    }
    return <Badge variant="secondary">{producto.stock}</Badge>
  }

  return (
    <div className="flex flex-col">
      <AppHeader title="Productos" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Gestión de Productos</CardTitle>
                <CardDescription>Administre el inventario de la ferretería</CardDescription>
              </div>
              <Button onClick={handleNewProducto}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, código o marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStock} onValueChange={setFilterStock}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo stock</SelectItem>
                  <SelectItem value="normal">Stock normal</SelectItem>
                  <SelectItem value="bajo">Stock bajo</SelectItem>
                  <SelectItem value="sin">Sin stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {filteredProductos.length === 0 ? (
              <Empty
                icon={<Package className="h-10 w-10" />}
                title="No se encontraron productos"
                description="No hay productos que coincidan con los criterios de búsqueda."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Marca</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProductos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-mono">{producto.codigo}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <span className="truncate font-medium">{producto.nombre}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{producto.marca}</TableCell>
                        <TableCell>{formatCurrency(producto.precio)}</TableCell>
                        <TableCell>{getStockBadge(producto)}</TableCell>
                        <TableCell>
                          <Badge variant={producto.estado === "activo" ? "default" : "secondary"}>
                            {producto.estado === "activo" ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewProducto(producto)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProducto(producto)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifique los datos del producto"
                : "Complete el formulario para registrar un nuevo producto"}
            </DialogDescription>
          </DialogHeader>
          <ProductoForm
            producto={isEditing ? selectedProducto || undefined : undefined}
            onSubmit={isEditing ? handleUpdateProducto : handleCreateProducto}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalle del Producto</SheetTitle>
            <SheetDescription>
              Información completa del producto seleccionado
            </SheetDescription>
          </SheetHeader>
          {selectedProducto && (
            <div className="mt-6">
              <ProductoDetail
                producto={selectedProducto}
                onEdit={() => handleEditProducto(selectedProducto)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
