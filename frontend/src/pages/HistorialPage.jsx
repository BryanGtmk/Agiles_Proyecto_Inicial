import { useMemo, useState } from 'react';
import { Eye, Slash } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { formatDateTime, formatInvoiceStatus, formatMoney } from '../lib/formatters';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import SectionHeader from '../components/ui/SectionHeader';
import InvoiceDetailDialog from '../components/forms/InvoiceDetailDialog';

export default function HistorialPage() {
  const { invoices, settings, invoiceStats, cancelInvoice } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const visibleInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => (statusFilter === 'todos' ? true : invoice.estado === statusFilter))
      .filter((invoice) => {
        if (!selectedDate) return true;
        return new Date(invoice.fecha).toDateString() === new Date(selectedDate).toDateString();
      })
      .filter((invoice) => {
        const text = `${invoice.numeroComprobante} ${invoice.clienteNombre}`.toLowerCase();
        return text.includes(search.toLowerCase());
      });
  }, [invoices, search, statusFilter, selectedDate]);

  return (
    <div className="page-stack">
      <section className="stats-grid stats-grid--three">
        <Card className="mini-stat"><span>Total de facturas</span><strong>{invoiceStats.total}</strong></Card>
        <Card className="mini-stat"><span>Emitidas</span><strong>{invoiceStats.emitidas}</strong></Card>
        <Card className="mini-stat"><span>Total facturado</span><strong>{formatMoney(invoiceStats.totalFacturado)}</strong></Card>
      </section>

      <Card>
        <SectionHeader eyebrow="Modulo de consulta" title="Historial de facturas" description="Consulta, filtra y revisa las facturas emitidas en la simulacion interna." />

        <div className="toolbar-grid toolbar-grid--history">
          <input className="field" placeholder="Buscar por numero de comprobante o cliente" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="emitida">Emitida</option>
            <option value="anulada">Anulada</option>
            <option value="pendiente">Pendiente</option>
          </select>
          <input className="field" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </div>

        <div className="table-wrap">
          {visibleInvoices.length === 0 ? (
            <EmptyState title="Sin resultados" description="Ajusta los filtros para ver facturas emitidas en el historial." />
          ) : (
            <table className="app-table">
              <thead>
                <tr>
                  <th>Numero</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Subtotal</th>
                  <th>IVA</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.numeroComprobante}</td>
                    <td>{formatDateTime(invoice.fecha)}</td>
                    <td>{invoice.clienteNombre}</td>
                    <td>{formatMoney(invoice.subtotal)}</td>
                    <td>{formatMoney(invoice.iva)}</td>
                    <td>{formatMoney(invoice.total)}</td>
                    <td><Badge tone={invoice.estado === 'emitida' ? 'success' : invoice.estado === 'anulada' ? 'danger' : 'warning'}>{formatInvoiceStatus(invoice.estado)}</Badge></td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" className="icon-button" onClick={() => setSelectedInvoice(invoice)} type="button"><Eye size={16} /></Button>
                        {invoice.estado === 'emitida' && (
                          <Button
                            variant="ghost"
                            className="icon-button"
                            onClick={() => {
                              try {
                                cancelInvoice(invoice.id);
                                toast.success('Factura anulada correctamente.');
                              } catch (error) {
                                toast.error(error.message || 'No se pudo anular la factura.');
                              }
                            }}
                            type="button"
                          >
                            <Slash size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <InvoiceDetailDialog
        open={Boolean(selectedInvoice)}
        invoice={selectedInvoice}
        settings={settings}
        onClose={() => setSelectedInvoice(null)}
        onCancel={(invoiceId) => {
          try {
            cancelInvoice(invoiceId);
            toast.success('Factura anulada correctamente.');
          } catch (error) {
            toast.error(error.message || 'No se pudo anular la factura.');
          }
          setSelectedInvoice(null);
        }}
      />
    </div>
  );
}
