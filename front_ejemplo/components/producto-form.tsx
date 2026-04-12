"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Producto, type EstadoProducto } from "@/lib/mock-data"

interface ProductoFormProps {
  producto?: Producto
  onSubmit: (data: Partial<Producto>) => void
  onCancel: () => void
}

export function ProductoForm({ producto, onSubmit, onCancel }: ProductoFormProps) {
  const [codigo, setCodigo] = useState(producto?.codigo || "")
  const [nombre, setNombre] = useState(producto?.nombre || "")
  const [marca, setMarca] = useState(producto?.marca || "")
  const [precio, setPrecio] = useState(producto?.precio?.toString() || "")
  const [stock, setStock] = useState(producto?.stock?.toString() || "")
  const [estado, setEstado] = useState<EstadoProducto>(producto?.estado || "activo")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data: Partial<Producto> = {
      codigo,
      nombre,
      marca,
      precio: parseFloat(precio),
      stock: parseInt(stock, 10),
      estado
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="codigo">Código</Label>
        <Input
          id="codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Ej: CEM-001"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre del Producto</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ingrese nombre del producto"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="marca">Marca</Label>
        <Input
          id="marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          placeholder="Ingrese marca"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="precio">Precio ($)</Label>
          <Input
            id="precio"
            type="number"
            step="0.01"
            min="0"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <Select value={estado} onValueChange={(v) => setEstado(v as EstadoProducto)}>
          <SelectTrigger id="estado">
            <SelectValue placeholder="Seleccione estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {producto ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  )
}
