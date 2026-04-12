export function validateEmail(value) {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateRuc(value) {
  return /^\d{13}$/.test(String(value || '').trim());
}

export function validateCedula(value) {
  return /^\d{10}$/.test(String(value || '').trim());
}

export function validatePasaporte(value) {
  const normalized = String(value || '').trim();
  return /^[A-Za-z0-9]{3,20}$/.test(normalized);
}

export function getIdentificationValidationError(type, value) {
  const normalized = String(value || '').trim();

  if (!normalized) {
    switch (type) {
      case 'cedula':
        return 'La c\u00E9dula debe tener exactamente 10 d\u00EDgitos num\u00E9ricos.';
      case 'ruc':
        return 'El RUC debe tener exactamente 13 d\u00EDgitos num\u00E9ricos.';
      case 'pasaporte':
        return 'El pasaporte debe tener entre 3 y 20 caracteres alfanum\u00E9ricos.';
      default:
        return 'Seleccione un tipo de identificaci\u00F3n v\u00E1lido.';
    }
  }

  switch (type) {
    case 'cedula':
      return validateCedula(normalized) ? '' : 'La c\u00E9dula debe tener exactamente 10 d\u00EDgitos num\u00E9ricos.';
    case 'ruc':
      return validateRuc(normalized) ? '' : 'El RUC debe tener exactamente 13 d\u00EDgitos num\u00E9ricos.';
    case 'pasaporte':
      return validatePasaporte(normalized) ? '' : 'El pasaporte debe tener entre 3 y 20 caracteres alfanum\u00E9ricos.';
    default:
      return 'Seleccione un tipo de identificaci\u00F3n v\u00E1lido.';
  }
}

export function validateIdentification(type, value) {
  return !getIdentificationValidationError(type, value);
}

export function normalizeProductCode(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}

export function isLowStock(stock) {
  const value = Number(stock || 0);
  return value > 0 && value <= 10;
}

export function isOutOfStock(stock) {
  return Number(stock || 0) === 0;
}
