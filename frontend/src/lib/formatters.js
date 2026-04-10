export function formatMoney(value) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export function formatInvoiceNumber(prefix, sequence) {
  const suffix = String(sequence).padStart(9, '0');
  return `${prefix}-${suffix}`;
}

export function formatClientName(client) {
  if (!client) {
    return '-';
  }

  if (client.tipoCliente === 'consumidor_final') {
    return 'CONSUMIDOR FINAL';
  }

  if (client.tipoCliente === 'persona_juridica') {
    return client.razonSocial || client.nombre || '-';
  }

  return [client.nombre, client.apellidos].filter(Boolean).join(' ').trim() || '-';
}

export function formatClientType(type) {
  switch (type) {
    case 'consumidor_final':
      return 'Consumidor final';
    case 'persona_natural':
      return 'Persona natural';
    case 'persona_juridica':
      return 'Persona juridica';
    default:
      return '-';
  }
}

export function formatIdentificationType(type) {
  switch (type) {
    case 'cedula':
      return 'Cedula';
    case 'ruc':
      return 'RUC';
    case 'pasaporte':
      return 'Pasaporte';
    default:
      return '-';
  }
}

export function formatInvoiceStatus(status) {
  switch (status) {
    case 'emitida':
      return 'Emitida';
    case 'anulada':
      return 'Anulada';
    case 'pendiente':
      return 'Pendiente';
    default:
      return '-';
  }
}

export function formatProductStatus(status) {
  return status === 'activo' ? 'Activo' : 'Inactivo';
}
