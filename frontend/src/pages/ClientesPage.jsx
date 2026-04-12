import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Power } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { formatClientName, formatClientType, formatIdentificationType } from '../lib/formatters';
import { getIdentificationValidationError, validateEmail } from '../lib/validators';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import SectionHeader from '../components/ui/SectionHeader';
import ClientFormDialog from '../components/forms/ClientFormDialog';

export default function ClientesPage() {
  const { clients, addClient, toggleClientStatus } = useAppContext();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const visibleClients = useMemo(() => {
    return clients
      .filter((client) => client.tipoCliente !== 'consumidor_final')
      .filter((client) => (typeFilter === 'todos' ? true : client.tipoCliente === typeFilter))
      .filter((client) => (statusFilter === 'todos' ? true : client.estado === statusFilter))
      .filter((client) => {
        const text = `${client.numeroIdentificacion} ${formatClientName(client)} ${client.correo}`.toLowerCase();
        return text.includes(search.toLowerCase());
      });
  }, [clients, search, typeFilter, statusFilter]);

  const clientStats = useMemo(() => {
    const all = clients.filter((client) => client.tipoCliente !== 'consumidor_final');
    const active = all.filter((client) => client.estado === 'activo').length;
    const inactive = all.filter((client) => client.estado === 'inactivo').length;

    return {
      total: all.length,
      active,
      inactive
    };
  }, [clients]);

  function openCreateDialog() {
    setEditingClient(null);
    setDialogOpen(true);
  }

  function openEditDialog(client) {
    setEditingClient(client);
    setDialogOpen(true);
  }

  function handleSave(payload) {
    const tipoIdentificacion = payload.tipoCliente === 'persona_juridica' ? 'ruc' : payload.tipoIdentificacion;

    if (!payload.tipoCliente) {
      throw new Error('Seleccione el tipo de cliente.');
    }

    if (!payload.numeroIdentificacion) {
      throw new Error('La identificacion es obligatoria.');
    }

    if (payload.correo && !validateEmail(payload.correo)) {
      throw new Error('Ingrese un correo valido.');
    }

    const identificationError = getIdentificationValidationError(tipoIdentificacion, payload.numeroIdentificacion);
    if (identificationError) {
      throw new Error(identificationError);
    }

    if (payload.tipoCliente === 'persona_juridica') {
      if (!payload.razonSocial) {
        throw new Error('La razon social es obligatoria.');
      }
    } else {
      if (!payload.nombre || !payload.apellidos) {
        throw new Error('Nombres y apellidos son obligatorios.');
      }
    }

    addClient({
      ...payload,
      tipoIdentificacion,
      id: editingClient?.id
    });

    toast.success(editingClient ? 'Cliente actualizado correctamente.' : 'Cliente registrado correctamente.');

    setDialogOpen(false);
    setEditingClient(null);
  }

  return (
    <div className="page-stack">
      <section className="stats-grid stats-grid--three">
        <Card className="mini-stat"><span>Total clientes</span><strong>{clientStats.total}</strong></Card>
        <Card className="mini-stat"><span>Activos</span><strong>{clientStats.active}</strong></Card>
        <Card className="mini-stat"><span>Inactivos</span><strong>{clientStats.inactive}</strong></Card>
      </section>

      <Card>
        <SectionHeader
          eyebrow="Clientes"
          title="Gestion de clientes"
          description="Consulta, filtra y administra clientes registrados sin incluir consumidor final."
          actions={<Button onClick={openCreateDialog}><Plus size={16} />Nuevo cliente</Button>}
        />

        <div className="toolbar-grid">
          <input className="field" placeholder="Buscar por identificacion, nombre o correo" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="field" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="todos">Todos los tipos</option>
            <option value="persona_natural">Persona natural</option>
            <option value="persona_juridica">Persona juridica</option>
          </select>
          <select className="field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="table-wrap">
          {visibleClients.length === 0 ? (
            <EmptyState
              title="No hay clientes que mostrar"
              description="Ajusta los filtros o registra un nuevo cliente para continuar."
              actionLabel="Nuevo cliente"
              onAction={openCreateDialog}
            />
          ) : (
            <table className="app-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Identificacion</th>
                  <th>Nombre / razon social</th>
                  <th>Correo</th>
                  <th>Telefono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleClients.map((client) => (
                  <tr key={client.id}>
                    <td>{formatClientType(client.tipoCliente)}</td>
                    <td>{client.numeroIdentificacion}</td>
                    <td>{formatClientName(client)}</td>
                    <td>{client.correo || '-'}</td>
                    <td>{client.telefono || '-'}</td>
                    <td><Badge tone={client.estado === 'activo' ? 'success' : 'danger'}>{client.estado}</Badge></td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" className="icon-button" onClick={() => setSelectedClient(client)} type="button"><Eye size={16} /></Button>
                        <Button variant="ghost" className="icon-button" onClick={() => openEditDialog(client)} type="button"><Pencil size={16} /></Button>
                        <Button
                          variant="ghost"
                          className="icon-button"
                          onClick={() => {
                            try {
                              toggleClientStatus(client.id);
                              toast.success('Estado del cliente actualizado.');
                            } catch (error) {
                              toast.error(error.message || 'No se pudo actualizar el estado del cliente.');
                            }
                          }}
                          type="button"
                        >
                          <Power size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ClientFormDialog
        open={dialogOpen}
        mode={editingClient ? 'edit' : 'create'}
        client={editingClient}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      {selectedClient && (
        <Card className="detail-card">
          <SectionHeader eyebrow="Detalle" title={formatClientName(selectedClient)} description="Datos completos del cliente seleccionado." actions={<Button variant="ghost" onClick={() => setSelectedClient(null)}>Cerrar</Button>} />
          <div className="detail-grid">
            <div><span>Tipo</span><strong>{formatClientType(selectedClient.tipoCliente)}</strong></div>
            <div><span>Identificacion</span><strong>{formatIdentificationType(selectedClient.tipoIdentificacion)}</strong></div>
            <div><span>Numero</span><strong>{selectedClient.numeroIdentificacion}</strong></div>
            <div><span>Correo</span><strong>{selectedClient.correo || '-'}</strong></div>
            <div><span>Telefono</span><strong>{selectedClient.telefono || '-'}</strong></div>
            <div><span>Direccion</span><strong>{selectedClient.direccion || '-'}</strong></div>
          </div>
        </Card>
      )}
    </div>
  );
}
