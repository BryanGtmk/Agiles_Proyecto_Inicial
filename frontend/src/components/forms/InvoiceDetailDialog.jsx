import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDateTime, formatInvoiceStatus, formatMoney } from '../../lib/formatters';

export default function InvoiceDetailDialog({ open, invoice, settings, onClose, onCancel }) {
  if (!invoice) {
    return null;
  }

  return (
    <Dialog
      open={open}
      title={`Factura ${invoice.numeroComprobante}`}
      description="Detalle completo de la factura registrada en el historial."
      onClose={onClose}
      footer={(
        <>
          {invoice.estado === 'emitida' && onCancel && (
            <Button variant="danger" type="button" onClick={() => onCancel(invoice.id)}>
              Anular factura
            </Button>
          )}
          <Button variant="ghost" type="button" onClick={onClose}>Cerrar</Button>
        </>
      )}
    >
      <div className="invoice-preview">
        <div className="invoice-preview__header">
          <div>
            <strong>{settings.nombreNegocio}</strong>
            <p>{settings.ruc}</p>
            <p>{settings.direccion}</p>
            <p>{settings.telefono}</p>
          </div>
          <div className="invoice-preview__status">
            <Badge tone={invoice.estado === 'emitida' ? 'success' : invoice.estado === 'anulada' ? 'danger' : 'warning'}>
              {formatInvoiceStatus(invoice.estado)}
            </Badge>
            <span>{formatDateTime(invoice.fecha)}</span>
          </div>
        </div>

        <div className="invoice-preview__grid">
          <div>
            <span>Cliente</span>
            <strong>{invoice.clienteNombre}</strong>
          </div>
          <div>
            <span>Identificacion</span>
            <strong>{invoice.clienteIdentificacion}</strong>
          </div>
          <div>
            <span>Comprobante</span>
            <strong>{invoice.numeroComprobante}</strong>
          </div>
        </div>

        <table className="app-table app-table--dense">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>P. Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={`${invoice.id}-${item.productoId}`}>
                <td>{item.codigo}</td>
                <td>
                  <strong>{item.nombre}</strong>
                  <p className="table-muted">{item.marca}</p>
                </td>
                <td>{item.cantidad}</td>
                <td>{formatMoney(item.precioUnitario)}</td>
                <td>{formatMoney(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-preview__totals">
          <div><span>Subtotal</span><strong>{formatMoney(invoice.subtotal)}</strong></div>
          <div><span>Descuento</span><strong>{formatMoney(invoice.descuento)}</strong></div>
          <div><span>IVA</span><strong>{formatMoney(invoice.iva)}</strong></div>
          <div className="invoice-preview__totals-total"><span>Total</span><strong>{formatMoney(invoice.total)}</strong></div>
        </div>
      </div>
    </Dialog>
  );
}
