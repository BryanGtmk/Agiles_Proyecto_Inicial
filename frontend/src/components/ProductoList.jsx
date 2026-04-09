export default function ProductoList({ productos, onAgregarProducto, loading, error }) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>3. Productos</h2>
          <p>Seleccione productos activos y agregue cantidades al detalle.</p>
        </div>
      </div>

      {loading ? (
        <div className="loader">Cargando productos...</div>
      ) : error ? (
        <div className="inline-message error">{error}</div>
      ) : (
        <div className="productos-grid">
          {productos.map((producto) => (
            <article key={producto.idProducto} className="product-card">
              <div>
                <strong>{producto.nombre}</strong>
                <p>{producto.marca}</p>
                <span className="chip">{producto.codigoProducto}</span>
              </div>
              <div className="product-meta">
                <span>Stock: {producto.stock}</span>
                <span>${producto.precio.toFixed(2)}</span>
              </div>
              <button type="button" onClick={() => onAgregarProducto(producto)}>
                Agregar
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
