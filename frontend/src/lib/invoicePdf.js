const DEFAULT_PROCESOS_API_URL = 'http://localhost:5002';

function getProcesosApiUrl() {
  return String(import.meta.env.VITE_PROCESOS_API_URL || DEFAULT_PROCESOS_API_URL).replace(/\/+$/, '');
}

function parseFileName(contentDisposition) {
  if (!contentDisposition) {
    return '';
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1] || '';
}

async function extractErrorMessage(response) {
  if (response.status === 405) {
    return 'El servicio de procesos no tiene habilitado el endpoint PDF. Reinicia ProcesosService y vuelve a intentar.';
  }

  try {
    const payload = await response.json();
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // Ignora errores al interpretar respuesta no JSON.
  }

  return `No se pudo generar el PDF (HTTP ${response.status}).`;
}

function buildFacturaPdfPayload(invoice, settings) {
  return {
    nombreNegocio: settings.nombreNegocio,
    rucNegocio: settings.ruc,
    direccionNegocio: settings.direccion,
    telefonoNegocio: settings.telefono,
    numeroComprobante: invoice.numeroComprobante,
    fechaEmision: invoice.fecha,
    nombreClienteFactura: invoice.clienteNombre,
    tipoIdentificacionComprador: invoice.tipoIdentificacionComprador,
    identificacionComprador: invoice.clienteIdentificacion,
    subtotal: Number(invoice.subtotal),
    descuento: Number(invoice.descuento),
    iva: Number(invoice.iva),
    total: Number(invoice.total),
    estado: invoice.estado,
    detalles: invoice.items.map((item) => ({
      codigoProducto: item.codigo,
      descripcionProducto: item.nombre,
      marcaProducto: item.marca,
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precioUnitario),
      subtotalLinea: Number(item.subtotal)
    }))
  };
}

export async function generateInvoicePdfFile({ invoice, settings, signal } = {}) {
  if (!invoice) {
    throw new Error('No hay datos de factura para generar el PDF.');
  }

  const endpoint = `${getProcesosApiUrl()}/api/facturas/pdf`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buildFacturaPdfPayload(invoice, settings)),
    signal
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  const blob = await response.blob();
  const suggestedFileName = parseFileName(response.headers.get('content-disposition'));
  const fileName = suggestedFileName || `${invoice.numeroComprobante || 'factura'}.pdf`;

  return { blob, fileName };
}
