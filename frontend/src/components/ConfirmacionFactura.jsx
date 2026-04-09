export default function ConfirmacionFactura({ factura, error }) {
  if (!factura && !error) {
    return null;
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>6. Confirmacion</h2>
          <p>Resultado final de la emision de factura.</p>
        </div>
      </div>

      {factura && (
        <div className="confirm-box success-box">
          <strong>Factura emitida correctamente.</strong>
          <span>Comprobante: {factura.numeroComprobante}</span>
          <span>Total: ${factura.total.toFixed(2)}</span>
        </div>
      )}

      {error && <div className="confirm-box error-box">{error}</div>}
    </section>
  );
}
