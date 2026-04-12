"use client"

import Link from "next/link"
import { Users, Package, FileText, DollarSign, AlertTriangle, Plus, UserPlus, PackagePlus } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useStore } from "@/lib/store-context"
import { formatCurrency, formatDate, getEstadoFacturaLabel, isLowStock, isOutOfStock } from "@/lib/mock-data"

export default function DashboardPage() {
  const { clientes, productos, facturas, configuracion } = useStore()

  // Calculate stats
  const clientesActivos = clientes.filter(c => c.estado === "activo").length
  const productosActivos = productos.filter(p => p.estado === "activo").length
  const today = new Date().toISOString().split("T")[0]
  const facturasHoy = facturas.filter(f => f.fecha === today && f.estado === "emitida")
  const ventasHoy = facturasHoy.reduce((sum, f) => sum + f.total, 0)
  const lowStockProducts = productos.filter(p => p.estado === "activo" && (isLowStock(p.stock) || isOutOfStock(p.stock)))
  const recentFacturas = facturas.slice(0, 5)

  return (
    <div className="flex flex-col">
      <AppHeader title="Dashboard" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes Registrados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientesActivos}</div>
              <p className="text-xs text-muted-foreground">clientes activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Productos Activos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productosActivos}</div>
              <p className="text-xs text-muted-foreground">en inventario</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Facturas Emitidas Hoy
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{facturasHoy.length}</div>
              <p className="text-xs text-muted-foreground">comprobantes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ventas del Día
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(ventasHoy)}</div>
              <p className="text-xs text-muted-foreground">total facturado</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Operaciones frecuentes del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/nueva-factura">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Factura
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/clientes?action=new">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar Cliente
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/productos?action=new">
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Registrar Producto
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Facturas Recientes</CardTitle>
              <CardDescription>Últimas facturas emitidas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comprobante</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentFacturas.map((factura) => (
                    <TableRow key={factura.id}>
                      <TableCell className="font-mono text-sm">
                        {factura.numeroComprobante}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {factura.clienteNombre}
                      </TableCell>
                      <TableCell>{formatCurrency(factura.total)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={factura.estado === "emitida" ? "default" : "destructive"}
                        >
                          {getEstadoFacturaLabel(factura.estado)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/historial">Ver todas las facturas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Productos con Stock Bajo
              </CardTitle>
              <CardDescription>Productos que requieren reabastecimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay productos con stock bajo.
                </p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((producto) => (
                    <div
                      key={producto.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{producto.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {producto.codigo} - {producto.marca}
                        </p>
                      </div>
                      <Badge
                        variant={isOutOfStock(producto.stock) ? "destructive" : "secondary"}
                        className={isLowStock(producto.stock) && !isOutOfStock(producto.stock) ? "bg-amber-100 text-amber-800" : ""}
                      >
                        {isOutOfStock(producto.stock) ? "Sin stock" : `${producto.stock} uds`}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/productos">Gestionar productos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Negocio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{configuracion.nombreNegocio}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RUC</p>
                <p className="font-medium">{configuracion.ruc}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{configuracion.telefono}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IVA</p>
                <p className="font-medium">{configuracion.iva}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
