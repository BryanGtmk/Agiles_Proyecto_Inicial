import { Banknote, Boxes, Building2, ClipboardList, LayoutDashboard, Settings2, Users } from 'lucide-react';
import { formatClientName } from '../../lib/formatters';
import Button from '../ui/Button';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'clientes', label: 'Clientes', icon: Users },
  { key: 'productos', label: 'Productos', icon: Boxes },
  { key: 'nueva-factura', label: 'Nueva Factura', icon: Banknote },
  { key: 'historial', label: 'Historial', icon: ClipboardList },
  { key: 'configuracion', label: 'Configuracion', icon: Settings2 }
];

export default function Sidebar({ open, currentRoute, onNavigate, settings, consumerFinal }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Building2 size={20} />
        </div>
        <div>
          <strong>{settings.nombreNegocio}</strong>
          <span>Facturacion ferreteria</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegacion principal">
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentRoute === item.key;

          return (
            <button
              key={item.key}
              type="button"
              className={`sidebar-link ${active ? 'sidebar-link--active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate(item.key)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-card">
        <p>Consumidor final fijo</p>
        <strong>{formatClientName(consumerFinal)}</strong>
        <span>{consumerFinal.numeroIdentificacion}</span>
      </div>

      <div className="sidebar-actions">
        <Button variant="secondary" type="button" onClick={() => onNavigate('nueva-factura')}>
          Nueva factura
        </Button>
      </div>
    </aside>
  );
}
