// Mock data for the ferretería invoicing system

export type TipoCliente = "consumidor_final" | "persona_natural" | "persona_juridica"
export type TipoIdentificacion = "cedula" | "ruc" | "pasaporte"
export type EstadoCliente = "activo" | "inactivo"
export type EstadoProducto = "activo" | "inactivo"
export type EstadoFactura = "emitida" | "anulada" | "pendiente"

export interface Cliente {
  id: string
  tipoCliente: TipoCliente
  tipoIdentificacion: TipoIdentificacion
  numeroIdentificacion: string
  nombre: string
  apellidos?: string
  razonSocial?: string
  correo: string
  telefono: string
  direccion: string
  estado: EstadoCliente
}

export interface Producto {
  id: string
  codigo: string
  nombre: string
  marca: string
  precio: number
  stock: number
  estado: EstadoProducto
}

export interface ItemFactura {
  productoId: string
  codigo: string
  nombre: string
  marca: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Factura {
  id: string
  numeroComprobante: string
  fecha: string
  clienteId: string
  clienteNombre: string
  clienteIdentificacion: string
  items: ItemFactura[]
  subtotal: number
  descuento: number
  iva: number
  total: number
  estado: EstadoFactura
}

export interface Configuracion {
  nombreNegocio: string
  ruc: string
  direccion: string
  telefono: string
  iva: number
  prefijoFactura: string
}

// Consumidor final predefinido
export const consumidorFinal: Cliente = {
  id: "cf-001",
  tipoCliente: "consumidor_final",
  tipoIdentificacion: "cedula",
  numeroIdentificacion: "9999999999999",
  nombre: "Consumidor Final",
  correo: "",
  telefono: "",
  direccion: "",
  estado: "activo"
}

// Mock clientes
export const mockClientes: Cliente[] = [
  consumidorFinal,
  {
    id: "cli-001",
    tipoCliente: "persona_natural",
    tipoIdentificacion: "cedula",
    numeroIdentificacion: "1712345678",
    nombre: "María",
    apellidos: "González Pérez",
    correo: "maria.gonzalez@email.com",
    telefono: "0991234567",
    direccion: "Av. 6 de Diciembre N45-32, Quito",
    estado: "activo"
  },
  {
    id: "cli-002",
    tipoCliente: "persona_natural",
    tipoIdentificacion: "cedula",
    numeroIdentificacion: "0912345678",
    nombre: "Carlos",
    apellidos: "Ramírez López",
    correo: "carlos.ramirez@email.com",
    telefono: "0987654321",
    direccion: "Av. 9 de Octubre 1234, Guayaquil",
    estado: "activo"
  },
  {
    id: "cli-003",
    tipoCliente: "persona_juridica",
    tipoIdentificacion: "ruc",
    numeroIdentificacion: "1790012345001",
    razonSocial: "Constructora Andina S.A.",
    nombre: "Constructora Andina S.A.",
    correo: "info@constructoraandina.com",
    telefono: "022456789",
    direccion: "Av. República E7-123, Quito",
    estado: "activo"
  },
  {
    id: "cli-004",
    tipoCliente: "persona_juridica",
    tipoIdentificacion: "ruc",
    numeroIdentificacion: "0990123456001",
    razonSocial: "Ferretería El Maestro Cía. Ltda.",
    nombre: "Ferretería El Maestro Cía. Ltda.",
    correo: "ventas@elmaestro.com",
    telefono: "042567890",
    direccion: "Av. Quito 567, Guayaquil",
    estado: "activo"
  },
  {
    id: "cli-005",
    tipoCliente: "persona_natural",
    tipoIdentificacion: "cedula",
    numeroIdentificacion: "0102345678",
    nombre: "Ana",
    apellidos: "Morales Vega",
    correo: "ana.morales@email.com",
    telefono: "0976543210",
    direccion: "Calle Larga 12-45, Cuenca",
    estado: "inactivo"
  }
]

// Mock productos
export const mockProductos: Producto[] = [
  {
    id: "prod-001",
    codigo: "CEM-001",
    nombre: "Cemento Portland 50kg",
    marca: "Holcim",
    precio: 8.50,
    stock: 150,
    estado: "activo"
  },
  {
    id: "prod-002",
    codigo: "VAR-001",
    nombre: "Varilla de acero 12mm x 12m",
    marca: "Adelca",
    precio: 12.75,
    stock: 80,
    estado: "activo"
  },
  {
    id: "prod-003",
    codigo: "PIN-001",
    nombre: "Pintura látex blanco 4L",
    marca: "Pintuco",
    precio: 18.99,
    stock: 45,
    estado: "activo"
  },
  {
    id: "prod-004",
    codigo: "TUB-001",
    nombre: "Tubo PVC 4\" x 6m",
    marca: "Plastigama",
    precio: 15.50,
    stock: 5,
    estado: "activo"
  },
  {
    id: "prod-005",
    codigo: "CAB-001",
    nombre: "Cable eléctrico #12 x 100m",
    marca: "Incable",
    precio: 45.00,
    stock: 25,
    estado: "activo"
  },
  {
    id: "prod-006",
    codigo: "LAD-001",
    nombre: "Ladrillo común",
    marca: "Ladrillera Nacional",
    precio: 0.18,
    stock: 3,
    estado: "activo"
  },
  {
    id: "prod-007",
    codigo: "CLA-001",
    nombre: "Clavos 2\" x 1lb",
    marca: "Ideal",
    precio: 1.25,
    stock: 200,
    estado: "activo"
  },
  {
    id: "prod-008",
    codigo: "MAR-001",
    nombre: "Martillo de uña 16oz",
    marca: "Stanley",
    precio: 12.50,
    stock: 30,
    estado: "activo"
  },
  {
    id: "prod-009",
    codigo: "DES-001",
    nombre: "Destornillador Phillips #2",
    marca: "Stanley",
    precio: 4.75,
    stock: 8,
    estado: "activo"
  },
  {
    id: "prod-010",
    codigo: "SIL-001",
    nombre: "Silicón transparente 280ml",
    marca: "Sika",
    precio: 5.99,
    stock: 60,
    estado: "activo"
  },
  {
    id: "prod-011",
    codigo: "BRO-001",
    nombre: "Brocha 4\"",
    marca: "Atlas",
    precio: 3.50,
    stock: 0,
    estado: "inactivo"
  },
  {
    id: "prod-012",
    codigo: "LLA-001",
    nombre: "Llave de paso 1/2\"",
    marca: "FV",
    precio: 8.25,
    stock: 40,
    estado: "activo"
  }
]

// Mock facturas
export const mockFacturas: Factura[] = [
  {
    id: "fac-001",
    numeroComprobante: "001-001-000000125",
    fecha: "2026-04-10",
    clienteId: "cli-001",
    clienteNombre: "María González Pérez",
    clienteIdentificacion: "1712345678",
    items: [
      { productoId: "prod-001", codigo: "CEM-001", nombre: "Cemento Portland 50kg", marca: "Holcim", cantidad: 10, precioUnitario: 8.50, subtotal: 85.00 },
      { productoId: "prod-007", codigo: "CLA-001", nombre: "Clavos 2\" x 1lb", marca: "Ideal", cantidad: 5, precioUnitario: 1.25, subtotal: 6.25 }
    ],
    subtotal: 91.25,
    descuento: 0,
    iva: 13.69,
    total: 104.94,
    estado: "emitida"
  },
  {
    id: "fac-002",
    numeroComprobante: "001-001-000000124",
    fecha: "2026-04-10",
    clienteId: "cli-003",
    clienteNombre: "Constructora Andina S.A.",
    clienteIdentificacion: "1790012345001",
    items: [
      { productoId: "prod-002", codigo: "VAR-001", nombre: "Varilla de acero 12mm x 12m", marca: "Adelca", cantidad: 50, precioUnitario: 12.75, subtotal: 637.50 },
      { productoId: "prod-001", codigo: "CEM-001", nombre: "Cemento Portland 50kg", marca: "Holcim", cantidad: 100, precioUnitario: 8.50, subtotal: 850.00 }
    ],
    subtotal: 1487.50,
    descuento: 50,
    iva: 215.63,
    total: 1653.13,
    estado: "emitida"
  },
  {
    id: "fac-003",
    numeroComprobante: "001-001-000000123",
    fecha: "2026-04-09",
    clienteId: "cf-001",
    clienteNombre: "Consumidor Final",
    clienteIdentificacion: "9999999999999",
    items: [
      { productoId: "prod-008", codigo: "MAR-001", nombre: "Martillo de uña 16oz", marca: "Stanley", cantidad: 1, precioUnitario: 12.50, subtotal: 12.50 },
      { productoId: "prod-009", codigo: "DES-001", nombre: "Destornillador Phillips #2", marca: "Stanley", cantidad: 2, precioUnitario: 4.75, subtotal: 9.50 }
    ],
    subtotal: 22.00,
    descuento: 0,
    iva: 3.30,
    total: 25.30,
    estado: "emitida"
  },
  {
    id: "fac-004",
    numeroComprobante: "001-001-000000122",
    fecha: "2026-04-09",
    clienteId: "cli-002",
    clienteNombre: "Carlos Ramírez López",
    clienteIdentificacion: "0912345678",
    items: [
      { productoId: "prod-003", codigo: "PIN-001", nombre: "Pintura látex blanco 4L", marca: "Pintuco", cantidad: 3, precioUnitario: 18.99, subtotal: 56.97 },
      { productoId: "prod-010", codigo: "SIL-001", nombre: "Silicón transparente 280ml", marca: "Sika", cantidad: 2, precioUnitario: 5.99, subtotal: 11.98 }
    ],
    subtotal: 68.95,
    descuento: 0,
    iva: 10.34,
    total: 79.29,
    estado: "emitida"
  },
  {
    id: "fac-005",
    numeroComprobante: "001-001-000000121",
    fecha: "2026-04-08",
    clienteId: "cli-004",
    clienteNombre: "Ferretería El Maestro Cía. Ltda.",
    clienteIdentificacion: "0990123456001",
    items: [
      { productoId: "prod-005", codigo: "CAB-001", nombre: "Cable eléctrico #12 x 100m", marca: "Incable", cantidad: 5, precioUnitario: 45.00, subtotal: 225.00 },
      { productoId: "prod-012", codigo: "LLA-001", nombre: "Llave de paso 1/2\"", marca: "FV", cantidad: 20, precioUnitario: 8.25, subtotal: 165.00 }
    ],
    subtotal: 390.00,
    descuento: 20,
    iva: 55.50,
    total: 425.50,
    estado: "anulada"
  }
]

// Mock configuración
export const mockConfiguracion: Configuracion = {
  nombreNegocio: "Ferretería Don Pedro",
  ruc: "1791234567001",
  direccion: "Av. 10 de Agosto N23-45, Quito",
  telefono: "022345678",
  iva: 15,
  prefijoFactura: "001-001"
}

// Helper functions
export function getTipoClienteLabel(tipo: TipoCliente): string {
  const labels: Record<TipoCliente, string> = {
    consumidor_final: "Consumidor Final",
    persona_natural: "Persona Natural",
    persona_juridica: "Persona Jurídica"
  }
  return labels[tipo]
}

export function getTipoIdentificacionLabel(tipo: TipoIdentificacion): string {
  const labels: Record<TipoIdentificacion, string> = {
    cedula: "Cédula",
    ruc: "RUC",
    pasaporte: "Pasaporte"
  }
  return labels[tipo]
}

export function getEstadoClienteLabel(estado: EstadoCliente): string {
  return estado === "activo" ? "Activo" : "Inactivo"
}

export function getEstadoProductoLabel(estado: EstadoProducto): string {
  return estado === "activo" ? "Activo" : "Inactivo"
}

export function getEstadoFacturaLabel(estado: EstadoFactura): string {
  const labels: Record<EstadoFactura, string> = {
    emitida: "Emitida",
    anulada: "Anulada",
    pendiente: "Pendiente"
  }
  return labels[estado]
}

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
}

export function getClienteDisplayName(cliente: Cliente): string {
  if (cliente.tipoCliente === "persona_juridica") {
    return cliente.razonSocial || cliente.nombre
  }
  if (cliente.tipoCliente === "persona_natural" && cliente.apellidos) {
    return `${cliente.nombre} ${cliente.apellidos}`
  }
  return cliente.nombre
}

export function isLowStock(stock: number): boolean {
  return stock <= 10 && stock > 0
}

export function isOutOfStock(stock: number): boolean {
  return stock === 0
}
