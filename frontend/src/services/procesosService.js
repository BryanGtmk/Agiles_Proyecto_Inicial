import {
  emitirFactura as emitirFacturaApi,
  obtenerFacturaPorId as obtenerFacturaPorIdApi,
  obtenerProductos as obtenerProductosApi
} from "../api/procesosApi";

async function ejecutarAccion(promise) {
  try {
    return await promise;
  } catch (error) {
    throw new Error(error.message || "Error en ProcesoService");
  }
}

export async function obtenerProductos() {
  return ejecutarAccion(obtenerProductosApi());
}

export async function crearFactura(data) {
  return ejecutarAccion(emitirFacturaApi(data));
}

export async function obtenerFacturaPorId(id) {
  return ejecutarAccion(obtenerFacturaPorIdApi(id));
}

export async function listarProductos() {
  return obtenerProductos();
}
