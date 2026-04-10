import { Plus, UserPlus, PackagePlus } from 'lucide-react';
import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDate, formatMoney, formatProductStatus, formatInvoiceStatus } from '../lib/formatters';
import { isLowStock } from '../lib/validators';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import SectionHeader from '../components/ui/SectionHeader';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function DashboardPage({ onNavigate }) {
  const { dashboardStats, settings, clients, products, invoices, lowStockProducts } = useAppContext();

  const recentInvoices = useMemo(() => invoices.slice(0, 5), [invoices]);
  const activeProducts = useMemo(() => products.filter((product) => product.estado === 'activo').slice(0, 8), [products]);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="section-eyebrow">Sistema administrativo</p>
          <h2>Controla clientes, inventario y facturacion en un solo lugar.</h2>
          <p>
            El flujo principal esta centrado en Nueva Factura, pero el resto del sistema mantiene la operacion administrativa alineada con la ferreteria.
          </p>
        </div>
        <div className="hero-card__actions">
          <Button onClick={() => onNavigate('nueva-factura')}>
            <Plus size={16} />
            Nueva factura
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('clientes')}>
            <UserPlus size={16} />
            Registrar cliente
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('productos')}>
            <PackagePlus size={16} />
            Registrar producto
          </Button>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Clientes activos" value={dashboardStats.activeClients} hint="Excluye consumidor final" tone="accent" />
        <StatCard label="Productos activos" value={dashboardStats.activeProducts} hint="Inventario habilitado para venta" tone="accent" />
        <StatCard label="Facturas hoy" value={dashboardStats.invoicesToday} hint="Emitidas en la jornada actual" tone="warning" />
        <StatCard label="Ventas del dia" value={formatMoney(dashboardStats.salesToday)} hint="Total acumulado de facturas emitidas hoy" tone="success" />
      </section>

      <section className="dashboard-grid">
        <Card className="dashboard-panel dashboard-panel--wide">
          <SectionHeader
            eyebrow="Acciones rapidas"
            title="Operaciones principales"
            description="Accesos directos al flujo del negocio."
          />

          <div className="quick-actions-grid">
            <button type="button" className="quick-action" onClick={() => onNavigate('nueva-factura')}>
              <strong>Nueva factura</strong>
              <span>Abre el flujo de emision</span>
            </button>
            <button type="button" className="quick-action" onClick={() => onNavigate('clientes')}>
              <strong>Clientes</strong>
              <span>Consulta y registra clientes</span>
            </button>
            <button type="button" className="quick-action" onClick={() => onNavigate('productos')}>
              <strong>Productos</strong>
              <span>Gestiona inventario y stock</span>
            </button>
          </div>
        </Card>

        <Card className="dashboard-panel">
          <SectionHeader eyebrow="Negocio" title="Datos de la empresa" description="Informacion base que aparece en la factura." />
          <div className="business-card">
            <div>
              <span>Nombre</span>
              <strong>{settings.nombreNegocio}</strong>
            </div>
            <div>
              <span>RUC</span>
              <strong>{settings.ruc}</strong>
            </div>
            <div>
              <span>Direccion</span>
              <strong>{settings.direccion}</strong>
            </div>
            <div>
              <span>Telefono</span>
              <strong>{settings.telefono}</strong>
            </div>
          </div>
        </Card>
      </section>

      <section className="dashboard-grid dashboard-grid--two-cols">
        <Card className="dashboard-panel">
          <SectionHeader eyebrow="Historial reciente" title="Ultimas facturas" description="Resumen de las facturas emitidas recientemente." />
          {recentInvoices.length === 0 ? (
            <EmptyState title="No hay facturas aun" description="Emite la primera factura para alimentar el historial." />
          ) : (
            <div className="table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Comprobante</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.numeroComprobante}</td>
                      <td>{invoice.clienteNombre}</td>
                      <td>{formatDate(invoice.fecha)}</td>
                      <td>{formatMoney(invoice.total)}</td>
                      <td><Badge tone={invoice.estado === 'emitida' ? 'success' : invoice.estado === 'anulada' ? 'danger' : 'warning'}>{formatInvoiceStatus(invoice.estado)}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="dashboard-panel">
          <SectionHeader eyebrow="Inventario" title="Stock bajo" description="Productos activos con stock critico o limitado." />
          {lowStockProducts.length === 0 ? (
            <EmptyState title="Sin alertas de stock" description="No hay productos con stock bajo en este momento." />
          ) : (
            <div className="stack-list">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="stack-list__item">
                  <div>
                    <strong>{product.nombre}</strong>
                    <p>{product.codigo} - {product.marca}</p>
                  </div>
                  <Badge tone={isLowStock(product.stock) ? 'warning' : 'neutral'}>
                    {product.stock} unidades
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="dashboard-grid dashboard-grid--two-cols">
        <Card className="dashboard-panel">
          <SectionHeader eyebrow="Catalogo" title="Productos destacados" description="Productos activos listos para facturacion." />
          <div className="mini-grid">
            {activeProducts.map((product) => (
              <article key={product.id} className="mini-card">
                <strong>{product.nombre}</strong>
                <span>{product.codigo}</span>
                <span>{product.marca}</span>
                <Badge tone={isLowStock(product.stock) ? 'warning' : 'success'}>{product.stock} stock</Badge>
                <p>{formatMoney(product.precio)}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card className="dashboard-panel">
          <SectionHeader eyebrow="Resumen" title="Indicadores adicionales" description="Para dimensionar rapidamente el estado del sistema." />
          <div className="summary-bullets">
            <div><span>Clientes registrados</span><strong>{clients.length - 1}</strong></div>
            <div><span>Facturas emitidas</span><strong>{invoices.filter((invoice) => invoice.estado === 'emitida').length}</strong></div>
            <div><span>Productos inactivos</span><strong>{products.filter((product) => product.estado === 'inactivo').length}</strong></div>
            <div><span>Total inventario activo</span><strong>{products.filter((product) => product.estado === 'activo').length}</strong></div>
          </div>
        </Card>
      </section>
    </div>
  );
}
