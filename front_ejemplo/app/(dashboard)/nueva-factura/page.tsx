"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  FileText,
  Printer
} from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Empty } from "@/components/ui/empty"
import { useStore } from "@/lib/store-context"
import { ClienteForm } from "@/components/cliente-form"
import {
  type Cliente,
  type Producto,
  type ItemFactura,
  type TipoCliente,
  type TipoIdentificacion,
  formatCurrency,
  formatDate,
  getClienteDisplayName,
  getTipoIdentificacionLabel,
  isLowStock,
  isOutOfStock
} from "@/lib/mock-data"
import { toast } from "sonner"

type TipoFacturacion = "consumidor_final" | "con_datos"
type Step = 1 | 2 | 3 | 4 | 5

interface CartItem extends ItemFactura {
  maxStock: number
}

export default function NuevaFacturaPage() {
  const router = useRouter()
  const {
    clientes,
    productos,
    addCliente,
    addFactura,
    getClienteByIdentificacion,
    configuracion,
    consumidorFinal
  } = useStore()

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>(1)
  
  // Step 1: Tipo de facturación
  const [tipoFacturacion, setTipoFacturacion] = useState<TipoFacturacion>("consumidor_final")
  
  // Step 2: Cliente
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>("persona_natural")
  const [tipoIdentificacion, setTipoIdentificacion] = useState<TipoIdentificacion>("cedula")
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("")
  const [clienteNotFound, setClienteNotFound] = useState(false)
  const [showClienteForm, setShowClienteForm] = useState(false)
  
  // Step 3: Productos
  const [productSearch, setProductSearch] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [descuento, setDescuento] = useState(0)
  
  // Step 5: Success
  const [facturaEmitida, setFacturaEmitida] = useState<{
    numeroComprobante: string
    fecha: string
    cliente: string
    total: number
  } | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Filtered products for search
  const filteredProductos = useMemo(() => {
    if (!productSearch) return productos.filter(p => p.estado === "activo")
    return productos.filter(p =>
      p.estado === "activo" && (
        p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.codigo.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.marca.toLowerCase().includes(productSearch.toLowerCase())
      )
    )
  }, [productos, productSearch])

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0)
  }, [cart])

  const ivaAmount = useMemo(() => {
    return (subtotal - descuento) * (configuracion.iva / 100)
  }, [subtotal, descuento, configuracion.iva])

  const total = useMemo(() => {
    return subtotal - descuento + ivaAmount
  }, [subtotal, descuento, ivaAmount])

  // Handlers
  const handleBuscarCliente = () => {
    const cliente = getClienteByIdentificacion(numeroIdentificacion)
    if (cliente) {
      setSelectedCliente(cliente)
      setClienteNotFound(false)
      setShowClienteForm(false)
    } else {
      setSelectedCliente(null)
      setClienteNotFound(true)
    }
  }

  const handleCreateCliente = (data: Partial<Cliente>) => {
    const newCliente = addCliente(data as Omit<Cliente, "id">)
    setSelectedCliente(newCliente)
    setShowClienteForm(false)
    setClienteNotFound(false)
    toast.success("Cliente registrado exitosamente")
  }

  const handleAddToCart = (producto: Producto) => {
    const existingItem = cart.find(item => item.productoId === producto.id)
    
    if (existingItem) {
      if (existingItem.cantidad < existingItem.maxStock) {
        setCart(cart.map(item =>
          item.productoId === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precioUnitario
              }
            : item
        ))
      } else {
        toast.error("No hay suficiente stock disponible")
      }
    } else {
      if (producto.stock > 0) {
        const newItem: CartItem = {
          productoId: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          marca: producto.marca,
          cantidad: 1,
          precioUnitario: producto.precio,
          subtotal: producto.precio,
          maxStock: producto.stock
        }
        setCart([...cart, newItem])
      } else {
        toast.error("Producto sin stock")
      }
    }
  }

  const handleUpdateQuantity = (productoId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productoId)
      return
    }
    
    setCart(cart.map(item => {
      if (item.productoId === productoId) {
        const quantity = Math.min(newQuantity, item.maxStock)
        return {
          ...item,
          cantidad: quantity,
          subtotal: quantity * item.precioUnitario
        }
      }
      return item
    }))
  }

  const handleRemoveFromCart = (productoId: string) => {
    setCart(cart.filter(item => item.productoId !== productoId))
  }

  const handleEmitirFactura = () => {
    const cliente = tipoFacturacion === "consumidor_final" ? consumidorFinal : selectedCliente
    
    if (!cliente) {
      toast.error("Seleccione un cliente")
      return
    }

    if (cart.length === 0) {
      toast.error("Agregue productos a la factura")
      return
    }

    const facturaData = {
      fecha: new Date().toISOString().split("T")[0],
      clienteId: cliente.id,
      clienteNombre: getClienteDisplayName(cliente),
      clienteIdentificacion: cliente.numeroIdentificacion,
      items: cart.map(({ maxStock, ...item }) => item),
      subtotal,
      descuento,
      iva: ivaAmount,
      total,
      estado: "emitida" as const
    }

    const factura = addFactura(facturaData)
    
    setFacturaEmitida({
      numeroComprobante: factura.numeroComprobante,
      fecha: factura.fecha,
      cliente: factura.clienteNombre,
      total: factura.total
    })
    
    setShowSuccessDialog(true)
  }

  const handleLimpiar = () => {
    setCurrentStep(1)
    setTipoFacturacion("consumidor_final")
    setSelectedCliente(null)
    setTipoCliente("persona_natural")
    setTipoIdentificacion("cedula")
    setNumeroIdentificacion("")
    setClienteNotFound(false)
    setShowClienteForm(false)
    setProductSearch("")
    setCart([])
    setDescuento(0)
    setFacturaEmitida(null)
  }

  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    handleLimpiar()
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true
      case 2:
        if (tipoFacturacion === "consumidor_final") return true
        return selectedCliente !== null
      case 3:
        return cart.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep === 2 && tipoFacturacion === "consumidor_final") {
      setSelectedCliente(consumidorFinal)
    }
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const steps = [
    { number: 1, title: "Tipo", description: "Tipo de facturación" },
    { number: 2, title: "Cliente", description: "Datos del cliente" },
    { number: 3, title: "Productos", description: "Agregar productos" },
    { number: 4, title: "Resumen", description: "Revisar factura" },
    { number: 5, title: "Confirmar", description: "Emitir factura" },
  ]

  const getStockBadge = (producto: Producto) => {
    if (isOutOfStock(producto.stock)) {
      return <Badge variant="destructive">Sin stock</Badge>
    }
    if (isLowStock(producto.stock)) {
      return <Badge className="bg-amber-100 text-amber-800">{producto.stock}</Badge>
    }
    return <Badge variant="secondary">{producto.stock}</Badge>
  }

  return (
    <div className="flex flex-col">
      <AppHeader title="Nueva Factura" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        {/* Progress Steps */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                        currentStep === step.number
                          ? "border-primary bg-primary text-primary-foreground"
                          : currentStep > step.number
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className="mt-2 hidden text-xs sm:block">
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 w-8 sm:w-16 lg:w-24 ${
                        currentStep > step.number
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Step 1: Tipo de Facturación */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tipo de Facturación</CardTitle>
                  <CardDescription>
                    Seleccione el tipo de factura a emitir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={tipoFacturacion}
                    onValueChange={(v) => setTipoFacturacion(v as TipoFacturacion)}
                    className="space-y-4"
                  >
                    <div className="flex items-start space-x-4 rounded-lg border border-border p-4 hover:bg-accent/50">
                      <RadioGroupItem value="consumidor_final" id="consumidor_final" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="consumidor_final" className="text-base font-medium cursor-pointer">
                          Consumidor Final
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Factura sin datos específicos del cliente
                        </p>
                      </div>
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex items-start space-x-4 rounded-lg border border-border p-4 hover:bg-accent/50">
                      <RadioGroupItem value="con_datos" id="con_datos" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="con_datos" className="text-base font-medium cursor-pointer">
                          Con Datos del Cliente
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Factura con identificación del cliente
                        </p>
                      </div>
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Cliente */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Datos del Cliente</CardTitle>
                  <CardDescription>
                    {tipoFacturacion === "consumidor_final"
                      ? "Factura para consumidor final"
                      : "Busque o registre el cliente"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tipoFacturacion === "consumidor_final" ? (
                    <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
                      <User className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">Consumidor Final</h3>
                      <p className="text-sm text-muted-foreground">
                        La factura se emitirá sin datos específicos del cliente
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {!showClienteForm && (
                        <>
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                              <Label>Tipo de Cliente</Label>
                              <Select
                                value={tipoCliente}
                                onValueChange={(v) => {
                                  setTipoCliente(v as TipoCliente)
                                  if (v === "persona_juridica") {
                                    setTipoIdentificacion("ruc")
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="persona_natural">Persona Natural</SelectItem>
                                  <SelectItem value="persona_juridica">Persona Jurídica</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo de Identificación</Label>
                              <Select
                                value={tipoIdentificacion}
                                onValueChange={(v) => setTipoIdentificacion(v as TipoIdentificacion)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {tipoCliente === "persona_natural" ? (
                                    <>
                                      <SelectItem value="cedula">Cédula</SelectItem>
                                      <SelectItem value="pasaporte">Pasaporte</SelectItem>
                                    </>
                                  ) : (
                                    <SelectItem value="ruc">RUC</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Número de Identificación</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={numeroIdentificacion}
                                  onChange={(e) => setNumeroIdentificacion(e.target.value)}
                                  placeholder="Ingrese número"
                                />
                                <Button onClick={handleBuscarCliente}>
                                  <Search className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {selectedCliente && (
                            <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
                              <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                  {selectedCliente.tipoCliente === "persona_juridica" ? (
                                    <Building2 className="h-5 w-5 text-primary" />
                                  ) : (
                                    <User className="h-5 w-5 text-primary" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold">{getClienteDisplayName(selectedCliente)}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {getTipoIdentificacionLabel(selectedCliente.tipoIdentificacion)}: {selectedCliente.numeroIdentificacion}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{selectedCliente.correo}</p>
                                </div>
                                <Badge variant="default">Seleccionado</Badge>
                              </div>
                            </div>
                          )}

                          {clienteNotFound && !selectedCliente && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                              <p className="text-sm text-amber-800">
                                Cliente no encontrado. ¿Desea registrar un nuevo cliente?
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setShowClienteForm(true)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Registrar Cliente
                              </Button>
                            </div>
                          )}
                        </>
                      )}

                      {showClienteForm && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Registrar Nuevo Cliente</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowClienteForm(false)}
                            >
                              Cancelar
                            </Button>
                          </div>
                          <ClienteForm
                            onSubmit={handleCreateCliente}
                            onCancel={() => setShowClienteForm(false)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Productos */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Productos</CardTitle>
                  <CardDescription>
                    Busque y agregue productos a la factura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, código o marca..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead className="hidden sm:table-cell">Marca</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProductos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No se encontraron productos
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredProductos.map((producto) => (
                            <TableRow key={producto.id}>
                              <TableCell className="font-mono text-sm">{producto.codigo}</TableCell>
                              <TableCell className="max-w-[150px] truncate">{producto.nombre}</TableCell>
                              <TableCell className="hidden sm:table-cell">{producto.marca}</TableCell>
                              <TableCell>{formatCurrency(producto.precio)}</TableCell>
                              <TableCell>{getStockBadge(producto)}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddToCart(producto)}
                                  disabled={isOutOfStock(producto.stock)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {cart.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="mb-4 font-medium flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Detalle de la Factura
                        </h4>
                        <div className="rounded-lg border border-border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-center">Cantidad</TableHead>
                                <TableHead className="text-right">P. Unit.</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cart.map((item) => (
                                <TableRow key={item.productoId}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{item.nombre}</p>
                                      <p className="text-sm text-muted-foreground">{item.codigo}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => handleUpdateQuantity(item.productoId, item.cantidad - 1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-8 text-center">{item.cantidad}</span>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        onClick={() => handleUpdateQuantity(item.productoId, item.cantidad + 1)}
                                        disabled={item.cantidad >= item.maxStock}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(item.precioUnitario)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(item.subtotal)}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-destructive"
                                      onClick={() => handleRemoveFromCart(item.productoId)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Resumen */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de la Factura</CardTitle>
                  <CardDescription>
                    Revise los datos antes de emitir la factura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="mb-3 font-medium">Cliente</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {tipoFacturacion === "consumidor_final" || selectedCliente?.tipoCliente === "consumidor_final" ? (
                          <User className="h-5 w-5 text-muted-foreground" />
                        ) : selectedCliente?.tipoCliente === "persona_juridica" ? (
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {selectedCliente ? getClienteDisplayName(selectedCliente) : "Consumidor Final"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCliente?.numeroIdentificacion || "9999999999999"}
                        </p>
                      </div>
                    </div>
                  </div>

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
                        {cart.map((item) => (
                          <TableRow key={item.productoId}>
                            <TableCell>{item.nombre}</TableCell>
                            <TableCell className="text-center">{item.cantidad}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.precioUnitario)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-2">
                    <Label>Descuento ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      max={subtotal}
                      step="0.01"
                      value={descuento}
                      onChange={(e) => setDescuento(Math.min(parseFloat(e.target.value) || 0, subtotal))}
                      className="max-w-[200px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Confirmación */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Confirmar Emisión</CardTitle>
                  <CardDescription>
                    Verifique los datos y emita la factura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6 text-center">
                    <FileText className="mx-auto h-12 w-12 text-primary" />
                    <h3 className="mt-4 text-xl font-semibold">Factura Lista para Emitir</h3>
                    <p className="mt-2 text-muted-foreground">
                      Total a facturar: <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button size="lg" onClick={handleEmitirFactura}>
                      <FileText className="mr-2 h-5 w-5" />
                      Emitir Factura
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => router.push("/")}>
                      Cancelar
                    </Button>
                    <Button size="lg" variant="ghost" onClick={handleLimpiar}>
                      Limpiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Resumen */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descuento:</span>
                    <span>-{formatCurrency(descuento)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA ({configuracion.iva}%):</span>
                    <span>{formatCurrency(ivaAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Productos:</span>
                    <span>{cart.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unidades:</span>
                    <span>{cart.reduce((sum, item) => sum + item.cantidad, 0)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Atrás
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleNext}
                    disabled={!canProceed() || currentStep === 5}
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              Factura Emitida Exitosamente
            </DialogTitle>
            <DialogDescription>
              La factura ha sido registrada en el sistema
            </DialogDescription>
          </DialogHeader>
          
          {facturaEmitida && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No. Comprobante:</span>
                  <span className="font-mono font-medium">{facturaEmitida.numeroComprobante}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span>{formatDate(facturaEmitida.fecha)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span>{facturaEmitida.cliente}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(facturaEmitida.total)}</span>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-border p-4">
                <h4 className="mb-2 font-medium flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Vista Previa de Factura
                </h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">{configuracion.nombreNegocio}</p>
                  <p>RUC: {configuracion.ruc}</p>
                  <p>{configuracion.direccion}</p>
                  <p>Tel: {configuracion.telefono}</p>
                  <Separator className="my-2" />
                  <p className="font-mono">{facturaEmitida.numeroComprobante}</p>
                  <p>{formatDate(facturaEmitida.fecha)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleSuccessClose}>
                  Nueva Factura
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => router.push("/historial")}>
                  Ver Historial
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
