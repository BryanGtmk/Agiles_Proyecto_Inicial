export const TIPO_FACTURACION = {
  CONSUMIDOR_FINAL: "consumidorFinal",
  CON_DATOS: "conDatos"
};

export const TIPOS_PERSONA = {
  NATURAL: "Natural",
  JURIDICA: "Juridica"
};

export const TIPOS_IDENTIFICACION = {
  ConsumidorFinal: "ConsumidorFinal",
  Cedula: "Cedula",
  Ruc: "Ruc",
  Pasaporte: "Pasaporte",
  IdentificacionExterior: "IdentificacionExterior"
};

export const IDENTIFICACIONES_NATURAL = [
  TIPOS_IDENTIFICACION.Cedula,
  TIPOS_IDENTIFICACION.Ruc,
  TIPOS_IDENTIFICACION.Pasaporte,
  TIPOS_IDENTIFICACION.IdentificacionExterior
];

export const IDENTIFICACIONES_JURIDICA = [
  TIPOS_IDENTIFICACION.Ruc,
  TIPOS_IDENTIFICACION.IdentificacionExterior
];

export const CONSUMIDOR_FINAL = {
  idCliente: 1,
  tipoIdentificacionFiscal: TIPOS_IDENTIFICACION.ConsumidorFinal,
  numeroIdentificacion: "9999999999999",
  nombreClienteFactura: "CONSUMIDOR FINAL"
};
