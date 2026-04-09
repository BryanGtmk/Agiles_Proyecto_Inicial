const PROCESOS_API = import.meta.env.VITE_PROCESOS_API_URL || "http://localhost:5002";

async function request(path, options = {}) {
  const response = await fetch(`${PROCESOS_API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error en servicio de procesos");
  }

  return response.json();
}

export function obtenerProductos() {
  return request("/api/productos");
}

export function emitirFactura(payload) {
  return request("/api/facturas", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function obtenerFacturaPorId(id) {
  const response = await fetch(`${PROCESOS_API}/api/facturas/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo obtener la factura");
  }

  return response.json();
}
