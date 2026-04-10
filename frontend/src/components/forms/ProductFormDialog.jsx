import { useEffect, useState } from 'react';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import { normalizeProductCode } from '../../lib/validators';

const emptyForm = {
  codigo: '',
  nombre: '',
  marca: '',
  precio: '',
  stock: '',
  estado: 'activo'
};

export default function ProductFormDialog({ open, product, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        codigo: product.codigo || '',
        nombre: product.nombre || '',
        marca: product.marca || '',
        precio: String(product.precio ?? ''),
        stock: String(product.stock ?? ''),
        estado: product.estado || 'activo'
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [product, open]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      onSave({
        ...form,
        codigo: normalizeProductCode(form.codigo),
        nombre: form.nombre.trim(),
        marca: form.marca.trim(),
        precio: Number(form.precio),
        stock: Number(form.stock)
      });
    } catch (submitError) {
      setError(submitError.message || 'No se pudo guardar el producto.');
    }
  }

  return (
    <Dialog
      open={open}
      title={product ? 'Editar producto' : 'Registrar producto'}
      description="Controla el inventario con codigo, precio, stock y estado."
      onClose={onClose}
      footer={(
        <>
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="product-form-dialog">Guardar</Button>
        </>
      )}
    >
      <form id="product-form-dialog" className="dialog-form" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--two-cols">
          <label>
            Codigo
            <input value={form.codigo} onChange={(event) => updateField('codigo', event.target.value)} />
          </label>

          <label>
            Estado
            <select value={form.estado} onChange={(event) => updateField('estado', event.target.value)}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>

          <label className="form-grid__full">
            Nombre
            <input value={form.nombre} onChange={(event) => updateField('nombre', event.target.value)} />
          </label>

          <label>
            Marca
            <input value={form.marca} onChange={(event) => updateField('marca', event.target.value)} />
          </label>

          <label>
            Precio
            <input type="number" min="0" step="0.01" value={form.precio} onChange={(event) => updateField('precio', event.target.value)} />
          </label>

          <label>
            Stock
            <input type="number" min="0" step="1" value={form.stock} onChange={(event) => updateField('stock', event.target.value)} />
          </label>
        </div>

        {error && <div className="inline-message inline-message--error">{error}</div>}
      </form>
    </Dialog>
  );
}
