import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { calculateSubtotal, clampDiscount } from '../lib/invoiceMath';
import { formatClientName, formatIdentificationType, formatInvoiceNumber, formatMoney } from '../lib/formatters';
import { validateIdentification } from '../lib/validators';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import SectionHeader from '../components/ui/SectionHeader';
import ClientFormDialog from '../components/forms/ClientFormDialog';

const initialSearch = {
  tipoCliente: 'persona_natural',
  tipoIdentificacion: 'cedula',
  numeroIdentificacion: ''
};

export default function NuevaFacturaPage() {
  const { settings, consumerFinal, products, searchClient, addClient, createInvoice, nextInvoiceSequence } = useAppContext();
  const [billingType, setBillingType] = useState('consumidor_final');
  const [clientSearch, setClientSearch] = useState(initialSearch);
  const [selectedClient, setSelectedClient] = useState(consumerFinal);
  const [selectedItems, setSelectedItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [productSearch, setProductSearch] = useState('');
  const [message, setMessage] = useState('');
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registerDraft, setRegisterDraft] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.codigo} ${product.nombre} ${product.marca}`.toLowerCase();
      return product.estado === 'activo' && text.includes(productSearch.toLowerCase());
    });
  }, [products, productSearch]);

  const subtotal = useMemo(() => calculateSubtotal(selectedItems), [selectedItems]);
  const discountApplied = useMemo(() => clampDiscount(subtotal, discount), [subtotal, discount]);
  const iva = useMemo(() => (subtotal - discountApplied) * (Number(settings.iva) / 100), [settings.iva, subtotal, discountApplied]);
  const total = useMemo(() => subtotal - discountApplied + iva, [subtotal, discountApplied, iva]);
  const flowReady = Boolean(selectedClient) && selectedItems.length > 0;

  function resetInvoiceState() {
    setSelectedClient(billingType === 'consumidor_final' ? consumerFinal : null);
    setSelectedItems([]);
    setDiscount(0);
    setProductSearch('');
    setMessage('');
    setLastInvoice(null);
  }

  function handleBillingTypeChange(value) {
    setBillingType(value);
    if (value === 'consumidor_final') {
      setSelectedClient(consumerFinal);
      setSelectedItems([]);
      setDiscount(0);
      setMessage('Se usara el cliente generico del sistema.');
      setRegisterDialogOpen(false);
      setRegisterDraft(null);
      return;
    }

    setSelectedClient(null);
    setMessage('Selecciona un cliente o registralo sin salir del flujo.');
  }

  function handleSearchClient() {
    const numero = clientSearch.numeroIdentificacion.trim();

    if (!validateIdentification(clientSearch.tipoIdentificacion, numero)) {
      setMessage('La identificacion ingresada no es valida para el tipo seleccionado.');
      return;
    }

    const found = searchClient({
      tipoIdentificacion: clientSearch.tipoIdentificacion,
      numeroIdentificacion: numero
    });

    if (found) {
      setSelectedClient(found);
      setMessage(`Cliente cargado: ${formatClientName(found)}.`);
      return;
    }

    setRegisterDraft({
      tipoCliente: clientSearch.tipoCliente,
      tipoIdentificacion: clientSearch.tipoIdentificacion,
      numeroIdentificacion: numero
    });
    setRegisterDialogOpen(true);
    toast.info('Cliente no encontrado. Puedes registrarlo sin salir del flujo.');
  }

  function handleSaveClient(payload) {
    const created = addClient({
      ...payload,
      id: registerDraft?.id,
      tipoCliente: payload.tipoCliente || registerDraft?.tipoCliente || 'persona_natural',
      tipoIdentificacion: payload.tipoCliente === 'persona_juridica' ? 'ruc' : payload.tipoIdentificacion || registerDraft?.tipoIdentificacion || 'cedula'
    });

    setSelectedClient(created);
    setBillingType('con_datos');
    setRegisterDialogOpen(false);
    setRegisterDraft(null);
    setMessage(`Cliente registrado y seleccionado: ${formatClientName(created)}.`);
    toast.success('Cliente registrado dentro del flujo de factura.');
  }

  function addProductToInvoice(product) {
    if (product.stock <= 0) {
      setMessage(`El producto ${product.nombre} no tiene stock disponible.`);
      return;
    }

    setSelectedItems((current) => {
      const existing = current.find((item) => item.productoId === product.id);

      if (existing) {
        if (existing.cantidad + 1 > product.stock) {
          setMessage(`No hay stock suficiente para ${product.nombre}.`);
          return current;
        }

        return current.map((item) =>
          item.productoId === product.id
            ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioUnitario }
            : item
        );
      }

      return [
        ...current,
        {
          productoId: product.id,
          codigo: product.codigo,
          nombre: product.nombre,
          marca: product.marca,
          cantidad: 1,
          precioUnitario: product.precio,
          subtotal: product.precio
        }
      ];
    });

    setMessage(`Producto agregado: ${product.nombre}.`);
    toast.success(`Producto agregado: ${product.nombre}.`);
  }

  function updateQuantity(productoId, value) {
    const quantity = Number(value);

    setSelectedItems((current) => {
      const item = current.find((detail) => detail.productoId === productoId);
      const product = products.find((entry) => entry.id === productoId);

      if (!product) {
        return current;
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return current.filter((detail) => detail.productoId !== productoId);
      }

      if (quantity > product.stock) {
        setMessage(`No hay stock suficiente para ${product.nombre}.`);
        return current;
      }

      return current.map((detail) =>
        detail.productoId === productoId
          ? { ...detail, cantidad: quantity, subtotal: quantity * item.precioUnitario }
          : detail
      );
    });
  }

  function removeItem(productoId) {
    setSelectedItems((current) => current.filter((detail) => detail.productoId !== productoId));
  }

  function emitInvoice() {
    try {
      if (!selectedClient) {
        throw new Error('Selecciona un cliente valido antes de emitir.');
      }

      if (selectedItems.length === 0) {
        throw new Error('Agrega al menos un producto antes de emitir.');
      }

      const invoice = createInvoice({
        clientId: selectedClient.id,
        items: selectedItems,
        discount: discountApplied
      });

      setLastInvoice(invoice);
      setMessage(`Factura emitida correctamente: ${invoice.numeroComprobante}.`);
      toast.success(`Factura emitida: ${invoice.numeroComprobante}.`);
      setSelectedItems([]);
      setDiscount(0);
      setProductSearch('');
    } catch (error) {
      setMessage(error.message || 'No se pudo emitir la factura.');
      toast.error(error.message || 'No se pudo emitir la factura.');
    }
  }

  return (
    <div className="page-stack">
      <section className="hero-card hero-card--compact">
        <div>
          <p className="section-eyebrow">Flujo principal</p>
          <h2>Nueva factura</h2>
          <p>Selecciona cliente, agrega productos, valida stock y emite el comprobante en un flujo secuencial.</p>
        </div>
        <div className="invoice-number-box">
          <span>Proximo comprobante</span>
          <strong>{formatInvoiceNumber(settings.prefijoFactura, nextInvoiceSequence)}</strong>
        </div>
      </section>

      <div className="invoice-stepper">
        <div className={billingType ? 'invoice-stepper__item invoice-stepper__item--active' : 'invoice-stepper__item'}>1. Tipo</div>
        <div className={selectedClient ? 'invoice-stepper__item invoice-stepper__item--active' : 'invoice-stepper__item'}>2. Cliente</div>
        <div className={selectedItems.length > 0 ? 'invoice-stepper__item invoice-stepper__item--active' : 'invoice-stepper__item'}>3. Productos</div>
        <div className={flowReady ? 'invoice-stepper__item invoice-stepper__item--active' : 'invoice-stepper__item'}>4. Totales</div>
        <div className={lastInvoice ? 'invoice-stepper__item invoice-stepper__item--active' : 'invoice-stepper__item'}>5. Emision</div>
      </div>

      {message && (
        <div className={`inline-message ${message.includes('correctamente') || message.includes('seleccionado') ? 'inline-message--success' : 'inline-message--info'}`}>
          {message.includes('correctamente') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message}</span>
        </div>
      )}

      <section className="invoice-layout">
        <div className="invoice-layout__left">
          <Card>
            <SectionHeader eyebrow="Paso 1" title="Tipo de facturacion" description="Define si la factura se emitira a consumidor final o con datos del cliente." />
            <div className="radio-grid">
              <button className={`radio-card ${billingType === 'consumidor_final' ? 'radio-card--active' : ''}`} type="button" onClick={() => handleBillingTypeChange('consumidor_final')}>
                <strong>Consumidor final</strong>
                <span>Usa el cliente generico del sistema.</span>
              </button>
              <button className={`radio-card ${billingType === 'con_datos' ? 'radio-card--active' : ''}`} type="button" onClick={() => handleBillingTypeChange('con_datos')}>
                <strong>Con datos del cliente</strong>
                <span>Busca un cliente existente o registralo al vuelo.</span>
              </button>
            </div>
          </Card>

          {billingType === 'con_datos' && (
            <Card>
              <SectionHeader eyebrow="Paso 2" title="Identificacion del cliente" description="Selecciona tipo de cliente, tipo de identificacion y numero para buscarlo." />
              <div className="form-grid form-grid--two-cols">
                <label>
                  Tipo de cliente
                  <select value={clientSearch.tipoCliente} onChange={(event) => setClientSearch((current) => ({ ...current, tipoCliente: event.target.value }))}>
                    <option value="persona_natural">Persona natural</option>
                    <option value="persona_juridica">Persona juridica</option>
                  </select>
                </label>
                <label>
                  Tipo de identificacion
                  <select value={clientSearch.tipoIdentificacion} onChange={(event) => setClientSearch((current) => ({ ...current, tipoIdentificacion: event.target.value }))}>
                    {clientSearch.tipoCliente === 'persona_juridica' ? <option value="ruc">RUC</option> : <><option value="cedula">Cedula</option><option value="pasaporte">Pasaporte</option><option value="ruc">RUC</option></>}
                  </select>
                </label>
                <label className="form-grid__full">
                  Numero de identificacion
                  <input value={clientSearch.numeroIdentificacion} onChange={(event) => setClientSearch((current) => ({ ...current, numeroIdentificacion: event.target.value }))} />
                </label>
              </div>
              <div className="form-actions">
                <Button type="button" onClick={handleSearchClient}><Search size={16} />Buscar cliente</Button>
                <Button variant="secondary" type="button" onClick={() => setRegisterDialogOpen(true)}>Registrar cliente</Button>
                <Button variant="ghost" type="button" onClick={() => handleBillingTypeChange('consumidor_final')}>Consumidor final</Button>
              </div>
              {selectedClient && billingType === 'con_datos' && (
                <div className="selected-client-card">
                  <Badge tone="success">Cliente cargado</Badge>
                  <strong>{formatClientName(selectedClient)}</strong>
                  <p>{formatIdentificationType(selectedClient.tipoIdentificacion)} - {selectedClient.numeroIdentificacion}</p>
                </div>
              )}
            </Card>
          )}

          <Card>
            <SectionHeader eyebrow="Paso 3" title="Seleccion de productos" description="Busca por nombre, codigo o marca y agrega unidades al detalle." />
            <div className="toolbar-grid toolbar-grid--invoice">
              <input className="field" placeholder="Buscar producto" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} />
              <Button variant="secondary" type="button" onClick={resetInvoiceState}>Limpiar flujo</Button>
            </div>
            <div className="product-picker-grid">
              {filteredProducts.length === 0 ? (
                <EmptyState title="No hay productos disponibles" description="Verifica el catalogo o ajusta la busqueda." />
              ) : (
                filteredProducts.map((product) => (
                  <article key={product.id} className="product-picker-card">
                    <div>
                      <strong>{product.nombre}</strong>
                      <p>{product.codigo} · {product.marca}</p>
                    </div>
                    <div className="product-picker-card__meta">
                      <Badge tone={product.stock === 0 ? 'danger' : product.stock <= 10 ? 'warning' : 'success'}>{product.stock} stock</Badge>
                      <span>{formatMoney(product.precio)}</span>
                    </div>
                    <Button type="button" onClick={() => addProductToInvoice(product)} disabled={product.stock === 0}><Plus size={16} />Agregar</Button>
                  </article>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="invoice-layout__right">
          <Card className="invoice-summary-card">
            <SectionHeader eyebrow="Paso 4" title="Resumen y validacion" description="Cliente, detalle, descuento, IVA y total." />

            <div className="summary-block">
              <span>Cliente seleccionado</span>
              <strong>{selectedClient ? formatClientName(selectedClient) : 'Sin cliente'}</strong>
            </div>

            <div className="summary-block">
              <span>Detalle de productos</span>
              {selectedItems.length === 0 ? (
                <p className="summary-empty">Aun no has agregado productos.</p>
              ) : (
                <div className="cart-list">
                  {selectedItems.map((item) => (
                    <div key={item.productoId} className="cart-list__item">
                      <div>
                        <strong>{item.nombre}</strong>
                        <p>{item.codigo} · {item.marca}</p>
                      </div>
                      <div className="cart-list__controls">
                        <input type="number" min="1" step="1" value={item.cantidad} onChange={(event) => updateQuantity(item.productoId, event.target.value)} />
                        <button type="button" className="icon-button icon-button--danger" onClick={() => removeItem(item.productoId)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="summary-block summary-block--discount">
              <label>
                Descuento
                <input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} />
              </label>
              <small>El descuento no puede superar el subtotal.</small>
            </div>

            <div className="totals-grid">
              <div><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
              <div><span>Descuento</span><strong>{formatMoney(discountApplied)}</strong></div>
              <div><span>IVA</span><strong>{formatMoney(iva)}</strong></div>
              <div className="totals-grid__total"><span>Total</span><strong>{formatMoney(total)}</strong></div>
            </div>

            <Button className="emit-button" type="button" onClick={emitInvoice} disabled={!flowReady}>
              Emitir factura
            </Button>

            {lastInvoice && (
              <div className="success-summary">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Factura emitida</strong>
                  <p>{lastInvoice.numeroComprobante} · {formatMoney(lastInvoice.total)}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      <ClientFormDialog
        open={registerDialogOpen}
        client={registerDraft ? {
          ...registerDraft,
          nombre: '',
          apellidos: '',
          razonSocial: '',
          correo: '',
          telefono: '',
          direccion: '',
          estado: 'activo'
        } : null}
        onClose={() => setRegisterDialogOpen(false)}
        onSave={handleSaveClient}
      />
    </div>
  );
}
