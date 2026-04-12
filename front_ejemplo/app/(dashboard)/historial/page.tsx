"use client"

import { useState, useMemo } from "react"
import { Search, FileText, Eye, Calendar, User } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Empty } from "@/components/ui/empty"
import { useStore } from "@/lib/store-context"
import {
  type Factura,
  formatCurrency,
  formatDate,
  getEstadoFacturaLabel
} from "@/lib/mock-data"

export default function HistorialPage() {
  const { facturas, clientes, configuracion } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [filterFecha, setFilterFecha] = useState<string>("")
  const [filterCliente, setFilterCliente] = useState<string>("all")
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Get unique clients from invoices
  const uniqueClientes = useMemo(() => {
    const clienteIds = [...new Set(facturas.map(f => f.clienteId))]
    return clientes.filter(c => clienteIds.includes(c.id))
  }, [facturas, clientes])

  // Filter invoices
  const filteredFacturas = useMemo(() => {
    return facturas.filter(f => {
      const matchesSearch = 
        f.numeroComprobante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesEstado = filterEstado === "all" || f.estado === filterEstado
      const matchesFecha = !filterFecha || f.fecha === filterFecha
      const matchesCliente = filterCliente === "all" || f.clienteId === filterCliente
      
      return matchesSearch && matchesEstado && matchesFecha && matchesCliente
    })
  }, [facturas, searchTerm, filterEstado, filterFecha, filterCliente])

  const handleViewDetail = (factura: Factura) => {
    setSelectedFactura(factura)
    setIsDetailOpen(true)
  }

  const getEstadoBadge = (estado: Factura["estado"]) => {
    switch (estado) {
      case "emitida":
        return <Badge>Emitida</Badge>
      case "anulada":
        return <Badge variant="destructive">Anulada</Badge>
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  // Calculate totals
  const totalFacturado = useMemo(() => {
    return filteredFacturas
      .filter(f => f.estado === "emitida")
      .reduce((sum, f) => sum + f.total, 0)
  }, [filteredFacturas])

  return (
    <div className="flex flex-col">
      <AppHeader title="Historial de Facturas" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Facturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredFacturas.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Facturas Emitidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredFacturas.filter(f => f.estado === "emitida").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Facturado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalFacturado)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Facturas</CardTitle>
            <CardDescription>Consulte todas las facturas emitidas</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={filterFecha}
                  onChange={(e) => setFilterFecha(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterCliente} onValueChange={setFilterCliente}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {uniqueClientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="emitida">Emitida</SelectItem>
                  <SelectItem value="anulada">Anulada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {filteredFacturas.length === 0 ? (
              <Empty
                icon={<FileText className="h-10 w-10" />}
                title="No se encontraron facturas"
                description="No hay facturas que coincidan con los criterios de búsqueda."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Comprobante</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">IVA</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFacturas.map((factura) => (
                      <TableRow key={factura.id}>
                        <TableCell className="font-mono text-sm">
                          {factura.numeroComprobante}
                        </TableCell>
                        <TableCell>{formatDate(factura.fecha)}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {factura.clienteNombre}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(factura.subtotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(factura.iva)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(factura.total)}
                        </TableCell>
                        <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(factura)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalle</span>
                          </Button>
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

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalle de Factura</SheetTitle>
            <SheetDescription>
              Información completa de la factura
            </SheetDescription>
          </SheetHeader>
          
          {selectedFactura && (
            <div className="mt-6 space-y-6">
              {/* Header info */}
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold">
                    {selectedFactura.numeroComprobante}
                  </span>
                  {getEstadoBadge(selectedFactura.estado)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {configuracion.nombreNegocio}
                </p>
              </div>

              {/* Date and Client */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{formatDate(selectedFactura.fecha)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium truncate">{selectedFactura.clienteNombre}</p>
                    <p className="text-xs text-muted-foreground">{selectedFactura.clienteIdentificacion}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="mb-3 font-medium">Detalle de Productos</h4>
                <div className="rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Cant.</TableHead>
                        <TableHead className="text-right">P. Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedFactura.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.nombre}</p>
                              <p className="text-xs text-muted-foreground">{item.codigo}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{item.cantidad}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.precioUnitario)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.subtotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(selectedFactura.subtotal)}</span>
                </div>
                {selectedFactura.descuento > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Descuento:</span>
                    <span>-{formatCurrency(selectedFactura.descuento)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA ({configuracion.iva}%):</span>
                  <span>{formatCurrency(selectedFactura.iva)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(selectedFactura.total)}</span>
                </div>
              </div>

              {/* Print preview */}
              <div className="rounded-lg border border-dashed border-border p-4">
                <h4 className="mb-3 font-medium">Vista Previa de Impresión</h4>
                <div className="text-sm text-muted-foreground space-y-1 font-mono">
                  <p className="font-bold text-foreground text-center">
                    {configuracion.nombreNegocio}
                  </p>
                  <p className="text-center">RUC: {configuracion.ruc}</p>
                  <p className="text-center">{configuracion.direccion}</p>
                  <p className="text-center">Tel: {configuracion.telefono}</p>
                  <Separator className="my-2" />
                  <p className="text-center font-bold">{selectedFactura.numeroComprobante}</p>
                  <p className="text-center">{formatDate(selectedFactura.fecha)}</p>
                  <Separator className="my-2" />
                  <p>Cliente: {selectedFactura.clienteNombre}</p>
                  <p>ID: {selectedFactura.clienteIdentificacion}</p>
                  <Separator className="my-2" />
                  {selectedFactura.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedFactura.subtotal)}</span>
                  </div>
                  {selectedFactura.descuento > 0 && (
                    <div className="flex justify-between">
                      <span>Descuento:</span>
                      <span>-{formatCurrency(selectedFactura.descuento)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>IVA {configuracion.iva}%:</span>
                    <span>{formatCurrency(selectedFactura.iva)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(selectedFactura.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
