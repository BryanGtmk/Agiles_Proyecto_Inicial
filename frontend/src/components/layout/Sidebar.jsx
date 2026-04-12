import { FileText, History, LayoutDashboard, Package, Settings, Users, Wrench } from 'lucide-react';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'clientes', label: 'Clientes', icon: Users },
  { key: 'productos', label: 'Productos', icon: Package },
  { key: 'nueva-factura', label: 'Nueva Factura', icon: FileText },
  { key: 'historial', label: 'Historial', icon: History },
  { key: 'configuracion', label: 'Configuracion', icon: Settings }
];

export default function Sidebar({ open, currentRoute, onNavigate, settings, consumerFinal }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Wrench size={20} />
        </div>
        <div>
          <strong>{settings.nombreNegocio}</strong>
          <span>Sistema de facturacion</span>
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
        <p>Cliente predeterminado</p>
        <strong>{consumerFinal.nombre}</strong>
        <span>{consumerFinal.numeroIdentificacion}</span>
      </div>
    </aside>
  );
}
