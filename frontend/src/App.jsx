import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import AppShell from './components/layout/AppShell';
import { AppProvider, useAppContext } from './context/AppContext';
import { useHashRoute } from './hooks/useHashRoute';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import ProductosPage from './pages/ProductosPage';
import NuevaFacturaPage from './pages/NuevaFacturaPage';
import HistorialPage from './pages/HistorialPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import './App.css';

function AppContent() {
  const { route, navigate } = useHashRoute();
  const { settings, consumerFinal } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    function onEscape(event) {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    }

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, []);

  const pages = {
    dashboard: <DashboardPage onNavigate={navigate} />,
    clientes: <ClientesPage />,
    productos: <ProductosPage />,
    'nueva-factura': <NuevaFacturaPage />,
    historial: <HistorialPage />,
    configuracion: <ConfiguracionPage />
  };

  return (
    <AppShell
      route={route}
      onNavigate={(nextRoute) => {
        navigate(nextRoute);
        setSidebarOpen(false);
      }}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen((current) => !current)}
      settings={settings}
      consumerFinal={consumerFinal}
    >
      {pages[route] || pages.dashboard}
      <Toaster richColors position="top-right" closeButton />
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
