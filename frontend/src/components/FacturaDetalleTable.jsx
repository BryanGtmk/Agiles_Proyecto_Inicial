export default function FacturaDetalleTable({ detalles, onChangeCantidad, onEliminarDetalle }) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>4. Detalle de factura</h2>
          <p>La cantidad puede ajustarse directamente desde la tabla.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Descripcion</th>
              <th>Cantidad</th>
              <th>P. Unitario</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {detalles.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  No hay productos agregados.
                </td>
              </tr>
            ) : (
              detalles.map((detalle) => (
                <tr key={detalle.idProducto}>
                  <td>{detalle.codigoProducto}</td>
                  <td>{detalle.descripcionProducto}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={detalle.cantidad}
                      onChange={(e) => onChangeCantidad(detalle.idProducto, e.target.value)}
                    />
                  </td>
                  <td>${detalle.precioUnitario.toFixed(2)}</td>
                  <td>${detalle.subtotalLinea.toFixed(2)}</td>
                  <td>
                    <button type="button" className="danger" onClick={() => onEliminarDetalle(detalle.idProducto)}>
                      Quitar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="field-hint">Cada producto debe tener cantidad mayor a cero y stock suficiente.</p>
    </section>
  );
}
