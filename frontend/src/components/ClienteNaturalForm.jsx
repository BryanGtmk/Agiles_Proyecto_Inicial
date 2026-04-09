export default function ClienteNaturalForm({ visible, formData, onChange, onSubmit, loading, error }) {
  if (!visible) {
    return null;
  }

  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <h2>2. Registrar cliente natural</h2>
          <p>Se muestra solo si el cliente no existe y la persona es natural.</p>
        </div>
      </div>

      <div className="form-grid">
        <input type="hidden" name="tipoPersona" value="Natural" readOnly />
        <label>
          Nombres
          <input name="nombres" value={formData.nombres} onChange={onChange} placeholder="Nombres" required />
        </label>
        <label>
          Apellidos
          <input name="apellidos" value={formData.apellidos} onChange={onChange} placeholder="Apellidos" required />
        </label>
        <label>
          Correo
          <input name="correo" value={formData.correo} onChange={onChange} placeholder="Correo" />
        </label>
        <label>
          Telefono
          <input name="telefono" value={formData.telefono} onChange={onChange} placeholder="Telefono" />
        </label>
        <label className="full-width">
          Direccion
          <input name="direccion" value={formData.direccion} onChange={onChange} placeholder="Direccion" />
        </label>
      </div>

      {error && <div className="inline-message error">{error}</div>}

      <p className="field-hint">Nombres, apellidos y número de identificación son obligatorios.</p>

      <div className="form-actions">
        <button type="button" onClick={onSubmit} disabled={loading}>
          {loading ? "Registrando..." : "Registrar cliente natural"}
        </button>
      </div>
    </section>
  );
}
