import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ route, onNavigate, sidebarOpen, onToggleSidebar, settings, consumerFinal, children }) {
  return (
    <div className={`app-shell ${sidebarOpen ? 'app-shell--sidebar-open' : ''}`}>
      <Sidebar open={sidebarOpen} currentRoute={route} onNavigate={onNavigate} settings={settings} consumerFinal={consumerFinal} />
      {sidebarOpen && <button type="button" aria-label="Cerrar menu" className="app-shell-backdrop" onClick={onToggleSidebar} />}

      <div className="app-shell-main">
        <Topbar route={route} onMenuClick={onToggleSidebar} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
