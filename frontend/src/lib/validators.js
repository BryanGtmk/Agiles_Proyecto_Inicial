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
  return /^[A-Za-z0-9]{5,20}$/.test(normalized);
}

export function validateIdentification(type, value) {
  const normalized = String(value || '').trim();

  if (!normalized) {
    return false;
  }

  switch (type) {
    case 'cedula':
      return validateCedula(normalized);
    case 'ruc':
      return validateRuc(normalized);
    case 'pasaporte':
      return validatePasaporte(normalized);
    default:
      return false;
  }
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
