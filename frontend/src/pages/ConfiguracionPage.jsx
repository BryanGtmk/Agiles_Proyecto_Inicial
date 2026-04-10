import { useState } from 'react';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { formatInvoiceNumber, formatMoney } from '../lib/formatters';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SectionHeader from '../components/ui/SectionHeader';

export default function ConfiguracionPage() {
  const { settings, updateSettings } = useAppContext();
  const [form, setForm] = useState(settings);
  const [message, setMessage] = useState('');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    try {
      updateSettings({
        ...form,
        iva: Number(form.iva)
      });
      setMessage('Configuracion guardada correctamente.');
      toast.success('Configuracion guardada correctamente.');
    } catch (error) {
      setMessage(error.message || 'No se pudo guardar la configuracion.');
      toast.error(error.message || 'No se pudo guardar la configuracion.');
    }
  }

  return (
    <div className="page-stack">
      <section className="dashboard-grid dashboard-grid--two-cols">
        <Card>
          <SectionHeader eyebrow="Configuracion" title="Parametros del negocio" description="Ajusta datos base, prefijo y IVA sin tocar el flujo de facturacion." />
          <div className="form-grid form-grid--two-cols">
            <label className="form-grid__full">
              Nombre del negocio
              <input value={form.nombreNegocio} onChange={(event) => updateField('nombreNegocio', event.target.value)} />
            </label>
            <label>
              RUC
              <input value={form.ruc} onChange={(event) => updateField('ruc', event.target.value)} />
            </label>
            <label>
              Telefono
              <input value={form.telefono} onChange={(event) => updateField('telefono', event.target.value)} />
            </label>
            <label className="form-grid__full">
              Direccion
              <input value={form.direccion} onChange={(event) => updateField('direccion', event.target.value)} />
            </label>
            <label>
              Prefijo de factura
              <input value={form.prefijoFactura} onChange={(event) => updateField('prefijoFactura', event.target.value)} />
            </label>
            <label>
              IVA %
              <input type="number" min="0" step="0.01" value={form.iva} onChange={(event) => updateField('iva', event.target.value)} />
            </label>
          </div>

          <div className="form-actions">
            <Button type="button" onClick={handleSave}>Guardar configuracion</Button>
          </div>

          {message && <div className="inline-message inline-message--info">{message}</div>}
        </Card>

        <Card>
          <SectionHeader eyebrow="Vista previa" title="Encabezado de factura" description="Esta tarjeta simula como saldra el comprobante." />
          <div className="invoice-preview invoice-preview--compact">
            <strong>{form.nombreNegocio}</strong>
            <p>RUC: {form.ruc}</p>
            <p>{form.direccion}</p>
            <p>{form.telefono}</p>
            <div className="invoice-preview__totals">
              <div><span>Prefijo</span><strong>{form.prefijoFactura}</strong></div>
              <div><span>IVA</span><strong>{Number(form.iva)}%</strong></div>
              <div><span>Comprobante</span><strong>{formatInvoiceNumber(form.prefijoFactura, 126)}</strong></div>
              <div><span>Ejemplo</span><strong>{formatMoney(100)}</strong></div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
