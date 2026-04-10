export function calculateSubtotal(items) {
  return items.reduce((total, item) => total + Number(item.subtotal || 0), 0);
}

export function clampDiscount(subtotal, discount) {
  const value = Number(discount || 0);
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.min(value, subtotal);
}

export function calculateIva(base, ivaPercent) {
  return Number(base || 0) * (Number(ivaPercent || 0) / 100);
}

export function calculateTotal(subtotal, discount, ivaPercent) {
  const appliedDiscount = clampDiscount(subtotal, discount);
  const base = subtotal - appliedDiscount;
  const iva = calculateIva(base, ivaPercent);
  return {
    subtotal,
    descuento: appliedDiscount,
    iva,
    total: base + iva
  };
}
