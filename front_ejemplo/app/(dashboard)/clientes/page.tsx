"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Plus, Eye, Pencil, User, Building2 } from "lucide-react"
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
import { ClienteForm } from "@/components/cliente-form"
import { ClienteDetail } from "@/components/cliente-detail"
import {
  type Cliente,
  type TipoCliente,
  getTipoClienteLabel,
  getTipoIdentificacionLabel,
  getClienteDisplayName
} from "@/lib/mock-data"
import { toast } from "sonner"

export default function ClientesPage() {
  const searchParams = useSearchParams()
  const { clientes, addCliente, updateCliente } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Check URL for new action
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setIsFormOpen(true)
      setSelectedCliente(null)
      setIsEditing(false)
    }
  }, [searchParams])

  // Filter clients (exclude consumidor final from list)
  const filteredClientes = useMemo(() => {
    return clientes
      .filter(c => c.tipoCliente !== "consumidor_final")
      .filter(c => {
        const matchesSearch = 
          getClienteDisplayName(c).toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.numeroIdentificacion.includes(searchTerm) ||
          c.correo.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesTipo = filterTipo === "all" || c.tipoCliente === filterTipo
        
        return matchesSearch && matchesTipo
      })
  }, [clientes, searchTerm, filterTipo])

  const handleCreateCliente = (data: Partial<Cliente>) => {
    addCliente(data as Omit<Cliente, "id">)
    setIsFormOpen(false)
    toast.success("Cliente registrado exitosamente")
  }

  const handleUpdateCliente = (data: Partial<Cliente>) => {
    if (selectedCliente) {
      updateCliente(selectedCliente.id, data)
      setIsFormOpen(false)
      setSelectedCliente(null)
      toast.success("Cliente actualizado exitosamente")
    }
  }

  const handleViewCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsDetailOpen(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsEditing(true)
    setIsDetailOpen(false)
    setIsFormOpen(true)
  }

  const handleNewCliente = () => {
    setSelectedCliente(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  return (
    <div className="flex flex-col">
      <AppHeader title="Clientes" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Gestión de Clientes</CardTitle>
                <CardDescription>Administre los clientes de la ferretería</CardDescription>
              </div>
              <Button onClick={handleNewCliente}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, identificación o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="persona_natural">Persona Natural</SelectItem>
                  <SelectItem value="persona_juridica">Persona Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {filteredClientes.length === 0 ? (
              <Empty
                icon={<User className="h-10 w-10" />}
                title="No se encontraron clientes"
                description="No hay clientes que coincidan con los criterios de búsqueda."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Identificación</TableHead>
                      <TableHead>Nombre / Razón Social</TableHead>
                      <TableHead className="hidden md:table-cell">Correo</TableHead>
                      <TableHead className="hidden lg:table-cell">Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {cliente.tipoCliente === "persona_juridica" ? (
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="hidden sm:inline">
                              {getTipoClienteLabel(cliente.tipoCliente)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {getTipoIdentificacionLabel(cliente.tipoIdentificacion)}:
                            </span>
                            <br />
                            <span className="font-mono">{cliente.numeroIdentificacion}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <span className="truncate font-medium">
                            {getClienteDisplayName(cliente)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {cliente.correo}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {cliente.telefono}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cliente.estado === "activo" ? "default" : "secondary"}>
                            {cliente.estado === "activo" ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewCliente(cliente)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCliente(cliente)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifique los datos del cliente"
                : "Complete el formulario para registrar un nuevo cliente"}
            </DialogDescription>
          </DialogHeader>
          <ClienteForm
            cliente={isEditing ? selectedCliente || undefined : undefined}
            onSubmit={isEditing ? handleUpdateCliente : handleCreateCliente}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalle del Cliente</SheetTitle>
            <SheetDescription>
              Información completa del cliente seleccionado
            </SheetDescription>
          </SheetHeader>
          {selectedCliente && (
            <div className="mt-6">
              <ClienteDetail
                cliente={selectedCliente}
                onEdit={() => handleEditCliente(selectedCliente)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
