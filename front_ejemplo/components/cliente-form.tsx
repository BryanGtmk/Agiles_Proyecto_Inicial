"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Cliente, type TipoCliente, type TipoIdentificacion } from "@/lib/mock-data"

interface ClienteFormProps {
  cliente?: Cliente
  onSubmit: (data: Partial<Cliente>) => void
  onCancel: () => void
}

export function ClienteForm({ cliente, onSubmit, onCancel }: ClienteFormProps) {
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>(cliente?.tipoCliente || "persona_natural")
  const [tipoIdentificacion, setTipoIdentificacion] = useState<TipoIdentificacion>(cliente?.tipoIdentificacion || "cedula")
  const [numeroIdentificacion, setNumeroIdentificacion] = useState(cliente?.numeroIdentificacion || "")
  const [nombre, setNombre] = useState(cliente?.nombre || "")
  const [apellidos, setApellidos] = useState(cliente?.apellidos || "")
  const [razonSocial, setRazonSocial] = useState(cliente?.razonSocial || "")
  const [correo, setCorreo] = useState(cliente?.correo || "")
  const [telefono, setTelefono] = useState(cliente?.telefono || "")
  const [direccion, setDireccion] = useState(cliente?.direccion || "")

  useEffect(() => {
    if (tipoCliente === "persona_juridica") {
      setTipoIdentificacion("ruc")
    }
  }, [tipoCliente])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data: Partial<Cliente> = {
      tipoCliente,
      tipoIdentificacion,
      numeroIdentificacion,
      correo,
      telefono,
      direccion,
      estado: cliente?.estado || "activo"
    }

    if (tipoCliente === "persona_natural") {
      data.nombre = nombre
      data.apellidos = apellidos
    } else {
      data.razonSocial = razonSocial
      data.nombre = razonSocial
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
        <Select value={tipoCliente} onValueChange={(v) => setTipoCliente(v as TipoCliente)}>
          <SelectTrigger id="tipoCliente">
            <SelectValue placeholder="Seleccione tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="persona_natural">Persona Natural</SelectItem>
            <SelectItem value="persona_juridica">Persona Jurídica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tipoCliente === "persona_natural" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombres</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese nombres"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input
                id="apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ingrese apellidos"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipoIdentificacion">Tipo de Identificación</Label>
              <Select value={tipoIdentificacion} onValueChange={(v) => setTipoIdentificacion(v as TipoIdentificacion)}>
                <SelectTrigger id="tipoIdentificacion">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cedula">Cédula</SelectItem>
                  <SelectItem value="pasaporte">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroIdentificacion">Número de Identificación</Label>
              <Input
                id="numeroIdentificacion"
                value={numeroIdentificacion}
                onChange={(e) => setNumeroIdentificacion(e.target.value)}
                placeholder="Ingrese número"
                required
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="razonSocial">Razón Social</Label>
            <Input
              id="razonSocial"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Ingrese razón social"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ruc">RUC</Label>
            <Input
              id="ruc"
              value={numeroIdentificacion}
              onChange={(e) => setNumeroIdentificacion(e.target.value)}
              placeholder="Ingrese RUC (13 dígitos)"
              required
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="correo">Correo Electrónico</Label>
        <Input
          id="correo"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="correo@ejemplo.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Ingrese teléfono"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Ingrese dirección"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {cliente ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  )
}
