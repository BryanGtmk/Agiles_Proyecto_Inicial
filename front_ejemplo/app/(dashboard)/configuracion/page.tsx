"use client"

import { useState } from "react"
import { Save, Building2, Phone, MapPin, Receipt, Percent } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store-context"
import { toast } from "sonner"

export default function ConfiguracionPage() {
  const { configuracion, updateConfiguracion } = useStore()
  
  const [nombreNegocio, setNombreNegocio] = useState(configuracion.nombreNegocio)
  const [ruc, setRuc] = useState(configuracion.ruc)
  const [direccion, setDireccion] = useState(configuracion.direccion)
  const [telefono, setTelefono] = useState(configuracion.telefono)
  const [iva, setIva] = useState(configuracion.iva.toString())
  const [prefijoFactura, setPrefijoFactura] = useState(configuracion.prefijoFactura)

  const handleSave = () => {
    updateConfiguracion({
      nombreNegocio,
      ruc,
      direccion,
      telefono,
      iva: parseFloat(iva),
      prefijoFactura
    })
    toast.success("Configuración guardada exitosamente")
  }

  return (
    <div className="flex flex-col">
      <AppHeader title="Configuración" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Negocio</CardTitle>
            <CardDescription>
              Configure los datos de su ferretería para la emisión de facturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Business Info */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-medium">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                Información del Negocio
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombreNegocio">Nombre del Negocio</Label>
                  <Input
                    id="nombreNegocio"
                    value={nombreNegocio}
                    onChange={(e) => setNombreNegocio(e.target.value)}
                    placeholder="Ingrese nombre del negocio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC</Label>
                  <Input
                    id="ruc"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                    placeholder="Ingrese RUC (13 dígitos)"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Info */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-medium">
                <Phone className="h-5 w-5 text-muted-foreground" />
                Información de Contacto
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="direccion"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Ingrese dirección completa"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ingrese teléfono"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Invoice Settings */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-medium">
                <Receipt className="h-5 w-5 text-muted-foreground" />
                Configuración de Facturación
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prefijoFactura">Prefijo de Factura</Label>
                  <Input
                    id="prefijoFactura"
                    value={prefijoFactura}
                    onChange={(e) => setPrefijoFactura(e.target.value)}
                    placeholder="Ej: 001-001"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: establecimiento-punto de emisión
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iva">IVA (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="iva"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={iva}
                      onChange={(e) => setIva(e.target.value)}
                      placeholder="15"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Porcentaje de IVA a aplicar en las facturas
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Preview */}
            <div>
              <h3 className="mb-4 font-medium">Vista Previa de Encabezado</h3>
              <div className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center">
                <p className="text-lg font-bold">{nombreNegocio || "Nombre del Negocio"}</p>
                <p className="text-sm text-muted-foreground">RUC: {ruc || "0000000000000"}</p>
                <p className="text-sm text-muted-foreground">{direccion || "Dirección"}</p>
                <p className="text-sm text-muted-foreground">Tel: {telefono || "000000000"}</p>
                <Separator className="my-3" />
                <p className="font-mono text-sm">
                  Factura No. {prefijoFactura || "000-000"}-000000001
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button size="lg" onClick={handleSave}>
                <Save className="mr-2 h-5 w-5" />
                Guardar Configuración
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información Importante</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                El RUC debe tener 13 dígitos para empresas ecuatorianas.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                El IVA actual en Ecuador es del 15%.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                El prefijo de factura identifica el establecimiento y punto de emisión.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Los cambios se aplicarán a las nuevas facturas emitidas.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
