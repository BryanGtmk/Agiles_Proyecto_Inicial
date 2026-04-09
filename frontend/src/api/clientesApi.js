const CLIENTES_API = import.meta.env.VITE_CLIENTES_API_URL || "http://localhost:5001";

async function request(path, options = {}) {
  const response = await fetch(`${CLIENTES_API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error en servicio de clientes");
  }

  return response.json();
}

export async function buscarCliente(tipoIdentificacion, numero) {
  const params = new URLSearchParams({ tipoIdentificacion, numero });
  const response = await fetch(`${CLIENTES_API}/api/clientes/buscar?${params.toString()}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo buscar el cliente");
  }

  return response.json();
}

export async function obtenerClientePorId(id) {
  const response = await fetch(`${CLIENTES_API}/api/clientes/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo obtener el cliente");
  }

  return response.json();
}

export function crearClienteNatural(payload) {
  return request("/api/clientes/natural", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function crearClienteJuridico(payload) {
  return request("/api/clientes/juridico", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
