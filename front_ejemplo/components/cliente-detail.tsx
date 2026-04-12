"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Mail, Phone, MapPin, User, Building2 } from "lucide-react"
import { type Cliente, getTipoClienteLabel, getTipoIdentificacionLabel, getClienteDisplayName } from "@/lib/mock-data"

interface ClienteDetailProps {
  cliente: Cliente
  onEdit: () => void
}

export function ClienteDetail({ cliente, onEdit }: ClienteDetailProps) {
  const displayName = getClienteDisplayName(cliente)
  const isJuridica = cliente.tipoCliente === "persona_juridica"

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isJuridica ? (
              <Building2 className="h-6 w-6 text-primary" />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{displayName}</h3>
            <p className="text-sm text-muted-foreground">
              {getTipoClienteLabel(cliente.tipoCliente)}
            </p>
          </div>
        </div>
        <Badge variant={cliente.estado === "activo" ? "default" : "secondary"}>
          {cliente.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 font-medium">Identificación</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo:</span>
              <span>{getTipoIdentificacionLabel(cliente.tipoIdentificacion)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Número:</span>
              <span className="font-mono">{cliente.numeroIdentificacion}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 font-medium">Contacto</h4>
          <div className="space-y-3">
            {cliente.correo && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{cliente.correo}</span>
              </div>
            )}
            {cliente.telefono && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{cliente.telefono}</span>
              </div>
            )}
            {cliente.direccion && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{cliente.direccion}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar Cliente
        </Button>
      </div>
    </div>
  )
}
