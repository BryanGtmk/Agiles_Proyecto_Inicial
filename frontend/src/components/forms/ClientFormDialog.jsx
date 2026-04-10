import { useEffect, useMemo, useState } from 'react';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';

const emptyForm = {
  tipoCliente: 'persona_natural',
  tipoIdentificacion: 'cedula',
  numeroIdentificacion: '',
  nombre: '',
  apellidos: '',
  razonSocial: '',
  correo: '',
  telefono: '',
  direccion: '',
  estado: 'activo'
};

export default function ClientFormDialog({ open, mode = 'create', client, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setForm({
        tipoCliente: client.tipoCliente || 'persona_natural',
        tipoIdentificacion: client.tipoIdentificacion || 'cedula',
        numeroIdentificacion: client.numeroIdentificacion || '',
        nombre: client.nombre || '',
        apellidos: client.apellidos || '',
        razonSocial: client.razonSocial || '',
        correo: client.correo || '',
        telefono: client.telefono || '',
        direccion: client.direccion || '',
        estado: client.estado || 'activo'
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [client, open]);

  const isJuricica = form.tipoCliente === 'persona_juridica';
  const title = useMemo(() => (mode === 'edit' ? 'Editar cliente' : 'Registrar cliente'), [mode]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = {
        ...form,
        numeroIdentificacion: form.numeroIdentificacion.trim(),
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        razonSocial: form.razonSocial.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim()
      };

      if (isJuricica) {
        payload.tipoIdentificacion = 'ruc';
      }

      onSave(payload);
    } catch (submitError) {
      setError(submitError.message || 'No se pudo guardar el cliente.');
    }
  }

  return (
    <Dialog
      open={open}
      title={title}
      description="Mantiene el flujo administrativo sin salir de la pantalla actual."
      onClose={onClose}
      footer={(
        <>
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="client-form-dialog">Guardar</Button>
        </>
      )}
    >
      <form id="client-form-dialog" className="dialog-form" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--two-cols">
          <label>
            Tipo de cliente
            <select value={form.tipoCliente} onChange={(event) => updateField('tipoCliente', event.target.value)}>
              <option value="persona_natural">Persona natural</option>
              <option value="persona_juridica">Persona juridica</option>
            </select>
          </label>

          <label>
            Estado
            <select value={form.estado} onChange={(event) => updateField('estado', event.target.value)}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>

          <label>
            Tipo de identificacion
            <select value={form.tipoIdentificacion} onChange={(event) => updateField('tipoIdentificacion', event.target.value)}>
              {form.tipoCliente === 'persona_juridica' ? (
                <option value="ruc">RUC</option>
              ) : (
                <>
                  <option value="cedula">Cedula</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="ruc">RUC</option>
                </>
              )}
            </select>
          </label>

          <label>
            Numero de identificacion
            <input value={form.numeroIdentificacion} onChange={(event) => updateField('numeroIdentificacion', event.target.value)} />
          </label>

          {form.tipoCliente === 'persona_juridica' ? (
            <label className="form-grid__full">
              Razon social
              <input value={form.razonSocial} onChange={(event) => updateField('razonSocial', event.target.value)} />
            </label>
          ) : (
            <>
              <label>
                Nombres
                <input value={form.nombre} onChange={(event) => updateField('nombre', event.target.value)} />
              </label>
              <label>
                Apellidos
                <input value={form.apellidos} onChange={(event) => updateField('apellidos', event.target.value)} />
              </label>
            </>
          )}

          <label>
            Correo
            <input type="email" value={form.correo} onChange={(event) => updateField('correo', event.target.value)} />
          </label>

          <label>
            Telefono
            <input value={form.telefono} onChange={(event) => updateField('telefono', event.target.value)} />
          </label>

          <label className="form-grid__full">
            Direccion
            <input value={form.direccion} onChange={(event) => updateField('direccion', event.target.value)} />
          </label>
        </div>

        {error && <div className="inline-message inline-message--error">{error}</div>}
      </form>
    </Dialog>
  );
}
