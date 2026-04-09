export default function ClienteSelector({
  tipoFacturacion,
  onChangeTipoFacturacion,
  tipoPersona,
  onChangeTipoPersona,
  tipoIdentificacion,
  onChangeTipoIdentificacion,
  numeroIdentificacion,
  onChangeNumeroIdentificacion,
  onBuscarCliente,
  identificacionesDisponibles,
  errorBusqueda,
  loadingCliente,
  clienteEncontrado,
  clienteSeleccionado,
  onUsarConsumidorFinal
}) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>1. Cliente</h2>
          <p>Primero define si la factura es para consumidor final o con datos del cliente.</p>
        </div>
      </div>

      <div className="radio-group">
        <label className={tipoFacturacion === "consumidorFinal" ? "radio-card active" : "radio-card"}>
          <input
            type="radio"
            name="tipoFacturacion"
            checked={tipoFacturacion === "consumidorFinal"}
            onChange={() => onChangeTipoFacturacion("consumidorFinal")}
          />
          <span>Consumidor final</span>
        </label>

        <label className={tipoFacturacion === "conDatos" ? "radio-card active" : "radio-card"}>
          <input
            type="radio"
            name="tipoFacturacion"
            checked={tipoFacturacion === "conDatos"}
            onChange={() => onChangeTipoFacturacion("conDatos")}
          />
          <span>Con datos del cliente</span>
        </label>
      </div>

      {tipoFacturacion === "conDatos" && (
        <div className="cliente-grid">
          <label>
            Tipo de persona
            <select value={tipoPersona} onChange={(e) => onChangeTipoPersona(e.target.value)} required>
              <option value="Natural">Persona natural</option>
              <option value="Juridica">Persona juridica</option>
            </select>
          </label>

          <label>
            Tipo de identificacion
            <select value={tipoIdentificacion} onChange={(e) => onChangeTipoIdentificacion(e.target.value)} required>
              {identificacionesDisponibles.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>

          <label>
            Numero de identificacion
            <input
              value={numeroIdentificacion}
              onChange={(e) => onChangeNumeroIdentificacion(e.target.value)}
              placeholder="Ingrese el numero"
              required
            />
          </label>

          <div className="cliente-actions">
            <button type="button" onClick={onBuscarCliente} disabled={loadingCliente}>
              {loadingCliente ? "Buscando..." : "Buscar cliente"}
            </button>

            <button type="button" className="ghost" onClick={onUsarConsumidorFinal}>
              Consumidor final
            </button>
          </div>
        </div>
      )}

      {clienteEncontrado && (
        <div className="inline-message success">
          Cliente encontrado: <strong>{clienteEncontrado.nombreClienteFactura}</strong>
        </div>
      )}

      {clienteSeleccionado && !clienteEncontrado && (
        <div className="inline-message info">
          Cliente seleccionado: <strong>{clienteSeleccionado.nombreClienteFactura}</strong>
        </div>
      )}

      {errorBusqueda && <div className="inline-message error">{errorBusqueda}</div>}
    </section>
  );
}
