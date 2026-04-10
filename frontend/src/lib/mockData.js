import { calculateTotal, clampDiscount } from './invoiceMath';
import { formatInvoiceNumber } from './formatters';

const now = new Date();

function isoDaysAgo(days) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function buildInvoice(sequence, client, items, settings, daysAgo = 0, status = 'emitida') {
  const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
  const discount = clampDiscount(subtotal, 0);
  const calculated = calculateTotal(subtotal, discount, settings.iva);

  return {
    id: `inv-${sequence}`,
    numeroComprobante: formatInvoiceNumber(settings.prefijoFactura, sequence),
    fecha: isoDaysAgo(daysAgo),
    clienteId: client.id,
    clienteNombre: client.tipoCliente === 'persona_juridica'
      ? client.razonSocial
      : `${client.nombre} ${client.apellidos || ''}`.trim(),
    clienteIdentificacion: client.numeroIdentificacion,
    tipoIdentificacionComprador: client.tipoIdentificacion,
    items,
    subtotal: calculated.subtotal,
    descuento: calculated.descuento,
    iva: calculated.iva,
    total: calculated.total,
    estado: status
  };
}

export const initialSettings = {
  nombreNegocio: 'Ferreteria Progreso',
  ruc: '1790012345001',
  direccion: 'Av. Principal 123 y Calle 10',
  telefono: '0991234567',
  iva: 15,
  prefijoFactura: '001-001'
};

export const consumerFinalClient = {
  id: 'cliente-consumidor-final',
  tipoCliente: 'consumidor_final',
  tipoIdentificacion: 'cedula',
  numeroIdentificacion: '9999999999999',
  nombre: 'Consumidor',
  apellidos: 'Final',
  correo: '',
  telefono: '',
  direccion: '',
  estado: 'activo'
};

export const initialClients = [
  consumerFinalClient,
  {
    id: 'cliente-001',
    tipoCliente: 'persona_natural',
    tipoIdentificacion: 'cedula',
    numeroIdentificacion: '0102030405',
    nombre: 'Juan',
    apellidos: 'Perez',
    correo: 'juan.perez@correo.com',
    telefono: '0987654321',
    direccion: 'Barrio Central',
    estado: 'activo'
  },
  {
    id: 'cliente-002',
    tipoCliente: 'persona_natural',
    tipoIdentificacion: 'pasaporte',
    numeroIdentificacion: 'AB12345',
    nombre: 'Maria',
    apellidos: 'Gomez',
    correo: 'maria.gomez@correo.com',
    telefono: '0977001122',
    direccion: 'Urbanizacion Los Pinos',
    estado: 'activo'
  },
  {
    id: 'cliente-003',
    tipoCliente: 'persona_juridica',
    tipoIdentificacion: 'ruc',
    numeroIdentificacion: '1790012345002',
    nombre: '',
    apellidos: '',
    razonSocial: 'Construcciones Andinas S.A.',
    correo: 'compras@andinas.com',
    telefono: '023333444',
    direccion: 'Parque Industrial',
    estado: 'activo'
  },
  {
    id: 'cliente-004',
    tipoCliente: 'persona_juridica',
    tipoIdentificacion: 'ruc',
    numeroIdentificacion: '1790012345003',
    nombre: '',
    apellidos: '',
    razonSocial: 'Ferreteria del Norte Cia. Ltda.',
    correo: 'ventas@norte.com',
    telefono: '024445566',
    direccion: 'Via a la Costa Km 2',
    estado: 'inactivo'
  }
];

export const initialProducts = [
  { id: 'prod-001', codigo: 'PERN-001', nombre: 'Perno hexagonal 1/2', marca: 'FixPro', precio: 0.85, stock: 42, estado: 'activo' },
  { id: 'prod-002', codigo: 'TAR-120', nombre: 'Tarugo plastico 8mm', marca: 'CasaForte', precio: 0.12, stock: 8, estado: 'activo' },
  { id: 'prod-003', codigo: 'SIL-300', nombre: 'Silicona multiuso', marca: 'Adhesa', precio: 2.95, stock: 18, estado: 'activo' },
  { id: 'prod-004', codigo: 'PINT-900', nombre: 'Pintura latex blanca', marca: 'ColorMax', precio: 18.5, stock: 6, estado: 'activo' },
  { id: 'prod-005', codigo: 'DIS-024', nombre: 'Disco corte metal 4 1/2', marca: 'MaxCut', precio: 1.7, stock: 0, estado: 'activo' },
  { id: 'prod-006', codigo: 'TUB-200', nombre: 'Tubo PVC 1/2', marca: 'AquaFlow', precio: 3.2, stock: 15, estado: 'activo' },
  { id: 'prod-007', codigo: 'LLA-451', nombre: 'Llave inglesa 10 pulgadas', marca: 'Forge', precio: 12.4, stock: 4, estado: 'activo' },
  { id: 'prod-008', codigo: 'CEM-050', nombre: 'Saco de cemento 50kg', marca: 'Ecuacem', precio: 8.9, stock: 22, estado: 'inactivo' }
];

export function buildInitialInvoices(settings = initialSettings, clients = initialClients) {
  const natural = clients.find((client) => client.id === 'cliente-001');
  const juridica = clients.find((client) => client.id === 'cliente-003');
  const anotherNatural = clients.find((client) => client.id === 'cliente-002');

  return [
    buildInvoice(126, natural, [
      { productoId: 'prod-001', codigo: 'PERN-001', nombre: 'Perno hexagonal 1/2', marca: 'FixPro', cantidad: 20, precioUnitario: 0.85, subtotal: 17 }
    ], settings, 0),
    buildInvoice(127, juridica, [
      { productoId: 'prod-004', codigo: 'PINT-900', nombre: 'Pintura latex blanca', marca: 'ColorMax', cantidad: 2, precioUnitario: 18.5, subtotal: 37 },
      { productoId: 'prod-003', codigo: 'SIL-300', nombre: 'Silicona multiuso', marca: 'Adhesa', cantidad: 4, precioUnitario: 2.95, subtotal: 11.8 }
    ], settings, 1),
    buildInvoice(128, anotherNatural, [
      { productoId: 'prod-007', codigo: 'LLA-451', nombre: 'Llave inglesa 10 pulgadas', marca: 'Forge', cantidad: 1, precioUnitario: 12.4, subtotal: 12.4 }
    ], settings, 2),
    buildInvoice(129, natural, [
      { productoId: 'prod-006', codigo: 'TUB-200', nombre: 'Tubo PVC 1/2', marca: 'AquaFlow', cantidad: 3, precioUnitario: 3.2, subtotal: 9.6 }
    ], settings, 3)
  ];
}
