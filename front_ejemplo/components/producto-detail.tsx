"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Package, DollarSign, Boxes, Tag } from "lucide-react"
import { type Producto, formatCurrency, isLowStock, isOutOfStock } from "@/lib/mock-data"

interface ProductoDetailProps {
  producto: Producto
  onEdit: () => void
}

export function ProductoDetail({ producto, onEdit }: ProductoDetailProps) {
  const getStockBadge = () => {
    if (isOutOfStock(producto.stock)) {
      return <Badge variant="destructive">Sin stock</Badge>
    }
    if (isLowStock(producto.stock)) {
      return <Badge className="bg-amber-100 text-amber-800">Stock bajo</Badge>
    }
    return <Badge variant="secondary">{producto.stock} unidades</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{producto.nombre}</h3>
            <p className="font-mono text-sm text-muted-foreground">{producto.codigo}</p>
          </div>
        </div>
        <Badge variant={producto.estado === "activo" ? "default" : "secondary"}>
          {producto.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 font-medium">Información del Producto</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Marca:</span>
              <span className="font-medium">{producto.marca}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Precio:</span>
              <span className="font-medium">{formatCurrency(producto.precio)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Boxes className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Stock:</span>
              {getStockBadge()}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 font-medium">Valor en Inventario</h4>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(producto.precio * producto.stock)}
          </div>
          <p className="text-sm text-muted-foreground">
            {producto.stock} unidades x {formatCurrency(producto.precio)}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar Producto
        </Button>
      </div>
    </div>
  )
}
