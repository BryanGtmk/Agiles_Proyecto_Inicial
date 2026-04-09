import {
  buscarCliente as buscarClienteApi,
  crearClienteJuridico as crearClienteJuridicoApi,
  crearClienteNatural as crearClienteNaturalApi,
  obtenerClientePorId as obtenerClientePorIdApi
} from "../api/clientesApi";

async function ejecutarAccion(promise) {
  try {
    return await promise;
  } catch (error) {
    throw new Error(error.message || "Error en ClienteService");
  }
}

export async function buscarClientePorIdentificacion(tipoIdentificacion, numeroIdentificacion) {
  return ejecutarAccion(buscarClienteApi(tipoIdentificacion, numeroIdentificacion));
}

export async function buscarCliente(tipoIdentificacion, numeroIdentificacion) {
  return buscarClientePorIdentificacion(tipoIdentificacion, numeroIdentificacion);
}

export async function crearClienteNatural(data) {
  return ejecutarAccion(crearClienteNaturalApi(data));
}

export async function crearClienteJuridico(data) {
  return ejecutarAccion(crearClienteJuridicoApi(data));
}

export async function obtenerClientePorId(id) {
  return ejecutarAccion(obtenerClientePorIdApi(id));
}

export async function registrarClienteNatural(payload) {
  return crearClienteNatural(payload);
}

export async function registrarClienteJuridico(payload) {
  return crearClienteJuridico(payload);
}
