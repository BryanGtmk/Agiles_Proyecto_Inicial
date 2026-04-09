export default function FacturaResumen({ subtotal, descuento, iva, total, descuentoInput, onChangeDescuento, onEmitirFactura, loading }) {
  return (
    <section className="panel summary-panel">
      <div className="section-header">
        <div>
          <h2>5. Resumen</h2>
          <p>Los importes se muestran para control visual, pero el backend recalcula el valor final.</p>
        </div>
      </div>

      <div className="summary-grid">
        <label>
          Descuento
          <input type="number" min="0" step="0.01" value={descuentoInput} onChange={onChangeDescuento} placeholder="0.00" />
        </label>

        <div className="summary-item">
          <span>Subtotal</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>
        <div className="summary-item">
          <span>Descuento</span>
          <strong>${descuento.toFixed(2)}</strong>
        </div>
        <div className="summary-item">
          <span>IVA</span>
          <strong>${iva.toFixed(2)}</strong>
        </div>
        <div className="summary-item total-item">
          <span>Total</span>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </div>

      <p className="field-hint">El descuento no puede ser negativo y el subtotal se calcula desde el detalle.</p>

      <button type="button" className="emit-button" onClick={onEmitirFactura} disabled={loading}>
        {loading ? "Emitiendo factura..." : "Emitir factura"}
      </button>
    </section>
  );
}
