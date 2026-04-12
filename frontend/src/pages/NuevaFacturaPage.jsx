import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { calculateSubtotal, clampDiscount } from '../lib/invoiceMath';
import { formatClientName, formatDate, formatIdentificationType, formatMoney } from '../lib/formatters';
import { isLowStock, isOutOfStock, validateIdentification } from '../lib/validators';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import SectionHeader from '../components/ui/SectionHeader';
import Dialog from '../components/ui/Dialog';

const initialSearch = {
  tipoCliente: 'persona_natural',
  tipoIdentificacion: 'cedula',
  numeroIdentificacion: ''
};

const steps = [
  { number: 1, title: 'Tipo', description: 'Tipo de facturacion' },
  { number: 2, title: 'Cliente', description: 'Datos del cliente' },
  { number: 3, title: 'Productos', description: 'Agregar productos' },
  { number: 4, title: 'Resumen', description: 'Revisar factura' },
  { number: 5, title: 'Confirmar', description: 'Emitir factura' }
];

export default function NuevaFacturaPage() {
  const { settings, consumerFinal, products, searchClient, addClient, createInvoice } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [billingType, setBillingType] = useState('consumidor_final');
  const [clientSearch, setClientSearch] = useState(initialSearch);
  const [selectedClient, setSelectedClient] = useState(consumerFinal);
  const [selectedItems, setSelectedItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [productSearch, setProductSearch] = useState('');
  const [message, setMessage] = useState('');
  const [clientNotFound, setClientNotFound] = useState(false);
  const [showInlineRegister, setShowInlineRegister] = useState(false);
  const [registerDraftForm, setRegisterDraftForm] = useState(null);
  const [registerDraft, setRegisterDraft] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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
  const unitsCount = useMemo(() => selectedItems.reduce((sum, item) => sum + Number(item.cantidad || 0), 0), [selectedItems]);

  function resetInvoiceState() {
    setCurrentStep(1);
    setBillingType('consumidor_final');
    setClientSearch(initialSearch);
    setSelectedClient(billingType === 'consumidor_final' ? consumerFinal : null);
    setSelectedItems([]);
    setDiscount(0);
    setProductSearch('');
    setMessage('');
    setClientNotFound(false);
    setShowInlineRegister(false);
    setRegisterDraftForm(null);
    setLastInvoice(null);
    setRegisterDraft(null);
    setShowSuccessDialog(false);
  }

  function handleBillingTypeChange(value) {
    setBillingType(value);
    if (value === 'consumidor_final') {
      setSelectedClient(consumerFinal);
      setSelectedItems([]);
      setDiscount(0);
      setMessage('Se usara el cliente generico del sistema.');
      setShowInlineRegister(false);
      setRegisterDraftForm(null);
      setRegisterDraft(null);
      setClientNotFound(false);
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
      setClientNotFound(false);
      setShowInlineRegister(false);
      setRegisterDraftForm(null);
      setMessage(`Cliente cargado: ${formatClientName(found)}.`);
      return;
    }

    setSelectedClient(null);
    setClientNotFound(true);
    setShowInlineRegister(false);
    setRegisterDraft({
      tipoCliente: clientSearch.tipoCliente,
      tipoIdentificacion: clientSearch.tipoIdentificacion,
      numeroIdentificacion: numero
    });
    toast.info('Cliente no encontrado. Puedes registrarlo en este paso.');
  }

  function openInlineRegister() {
    const draft = {
      tipoCliente: registerDraft?.tipoCliente || clientSearch.tipoCliente || 'persona_natural',
      tipoIdentificacion: registerDraft?.tipoIdentificacion || clientSearch.tipoIdentificacion || 'cedula',
      numeroIdentificacion: registerDraft?.numeroIdentificacion || clientSearch.numeroIdentificacion || '',
      nombre: '',
      apellidos: '',
      razonSocial: '',
      correo: '',
      telefono: '',
      direccion: ''
    };
    setRegisterDraftForm(draft);
    setShowInlineRegister(true);
  }

  function updateRegisterField(field, value) {
    setRegisterDraftForm((current) => ({ ...current, [field]: value }));
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
    setShowInlineRegister(false);
    setRegisterDraftForm(null);
    setRegisterDraft(null);
    setClientNotFound(false);
    setMessage(`Cliente registrado y seleccionado: ${formatClientName(created)}.`);
    toast.success('Cliente registrado dentro del flujo de factura.');
  }

  function handleSaveInlineClient() {
    if (!registerDraftForm) {
      return;
    }

    handleSaveClient(registerDraftForm);
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
          subtotal: product.precio,
          maxStock: product.stock
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
          ? { ...detail, cantidad: quantity, subtotal: quantity * detail.precioUnitario }
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
        items: selectedItems.map(({ maxStock, ...item }) => item),
        discount: discountApplied
      });

      setLastInvoice(invoice);
      setShowSuccessDialog(true);
      setCurrentStep(5);
      setMessage(`Factura emitida correctamente: ${invoice.numeroComprobante}.`);
      toast.success(`Factura emitida: ${invoice.numeroComprobante}.`);
    } catch (error) {
      setMessage(error.message || 'No se pudo emitir la factura.');
      toast.error(error.message || 'No se pudo emitir la factura.');
    }
  }

  function canProceed() {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return billingType === 'consumidor_final' || Boolean(selectedClient);
      case 3:
        return selectedItems.length > 0;
      case 4:
        return flowReady;
      default:
        return false;
    }
  }

  function handleNext() {
    if (!canProceed()) {
      return;
    }

    if (currentStep === 2 && billingType === 'consumidor_final') {
      setSelectedClient(consumerFinal);
    }

    if (currentStep < 5) {
      setCurrentStep((step) => step + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    }
  }

  function getStockBadge(product) {
    if (isOutOfStock(product.stock)) {
      return <Badge tone="danger">Sin stock</Badge>;
    }

    if (isLowStock(product.stock)) {
      return <Badge tone="warning">{product.stock}</Badge>;
    }

    return <Badge tone="success">{product.stock}</Badge>;
  }

  function goToHistory() {
    window.location.hash = '#/historial';
  }

  function closeSuccessDialog() {
    setShowSuccessDialog(false);
    resetInvoiceState();
  }

  return (
    <div className="page-stack">
      <div className="invoice-stepper">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`invoice-stepper__item ${currentStep >= step.number ? 'invoice-stepper__item--active' : ''} ${currentStep > step.number ? 'invoice-stepper__item--done' : ''}`.trim()}
          >
            <div className="invoice-stepper__top">
              <div className="invoice-stepper__dot">{currentStep > step.number ? <CheckCircle2 size={14} /> : step.number}</div>
              {step.number < steps.length && <span className="invoice-stepper__line" />}
            </div>
            <small>{step.title}</small>
          </div>
        ))}
      </div>

      {message && (
        <div className={`inline-message ${message.includes('correctamente') || message.includes('seleccionado') ? 'inline-message--success' : 'inline-message--info'}`}>
          {message.includes('correctamente') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message}</span>
        </div>
      )}

      <section className="invoice-layout">
        <div className="invoice-layout__left">
          {currentStep === 1 && (
            <Card>
              <SectionHeader eyebrow="Paso 1" title="Tipo de facturacion" description="Define si la factura se emitira a consumidor final o con datos del cliente." />
              <div className="radio-grid">
                <button className={`radio-card invoice-choice ${billingType === 'consumidor_final' ? 'radio-card--active' : ''}`} type="button" onClick={() => handleBillingTypeChange('consumidor_final')}>
                  <span className="invoice-choice__radio" />
                  <div>
                    <strong>Consumidor Final</strong>
                    <span>Factura sin datos especificos del cliente</span>
                  </div>
                  <User size={24} />
                </button>
                <button className={`radio-card invoice-choice ${billingType === 'con_datos' ? 'radio-card--active' : ''}`} type="button" onClick={() => handleBillingTypeChange('con_datos')}>
                  <span className="invoice-choice__radio" />
                  <div>
                    <strong>Con Datos del Cliente</strong>
                    <span>Factura con identificacion del cliente</span>
                  </div>
                  <Building2 size={24} />
                </button>
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <SectionHeader
                eyebrow="Paso 2"
                title="Datos del cliente"
                description={billingType === 'consumidor_final' ? 'La factura se emitira con consumidor final.' : 'Busca o registra al cliente.'}
              />

              {billingType === 'consumidor_final' ? (
                <div className="selected-client-card">
                  <Badge tone="success">Consumidor final</Badge>
                  <strong>{formatClientName(consumerFinal)}</strong>
                  <p>{formatIdentificationType(consumerFinal.tipoIdentificacion)} - {consumerFinal.numeroIdentificacion}</p>
                </div>
              ) : (
                <>
                  <div className="form-grid form-grid--two-cols">
                    <label>
                      Tipo de Cliente
                      <select
                        value={clientSearch.tipoCliente}
                        onChange={(event) => {
                          const nextTipoCliente = event.target.value;
                          setClientSearch((current) => ({
                            ...current,
                            tipoCliente: nextTipoCliente,
                            tipoIdentificacion: nextTipoCliente === 'persona_juridica' ? 'ruc' : current.tipoIdentificacion
                          }));
                        }}
                      >
                        <option value="persona_natural">Persona natural</option>
                        <option value="persona_juridica">Persona juridica</option>
                      </select>
                    </label>
                    <label>
                      Tipo de Identificacion
                      <select
                        value={clientSearch.tipoIdentificacion}
                        onChange={(event) => setClientSearch((current) => ({ ...current, tipoIdentificacion: event.target.value }))}
                      >
                        {clientSearch.tipoCliente === 'persona_juridica' ? (
                          <option value="ruc">RUC</option>
                        ) : (
                          <>
                            <option value="cedula">Cedula</option>
                            <option value="pasaporte">Pasaporte</option>
                          </>
                        )}
                      </select>
                    </label>
                    <label className="form-grid__full invoice-search-group">
                      Numero de Identificacion
                      <div className="invoice-search-input">
                        <input
                          value={clientSearch.numeroIdentificacion}
                          placeholder="Ingrese numero"
                          onChange={(event) => setClientSearch((current) => ({ ...current, numeroIdentificacion: event.target.value }))}
                        />
                        <Button type="button" onClick={handleSearchClient}>
                          <Search size={16} />
                        </Button>
                      </div>
                    </label>
                  </div>

                  {selectedClient && (
                    <div className="selected-client-card">
                      <User size={24} />
                      <div>
                        <strong>{formatClientName(selectedClient)}</strong>
                        <p>{formatIdentificationType(selectedClient.tipoIdentificacion)}: {selectedClient.numeroIdentificacion}</p>
                        <p>{selectedClient.correo || '-'}</p>
                      </div>
                      <Badge tone="success">Seleccionado</Badge>
                    </div>
                  )}

                  {clientNotFound && !selectedClient && (
                    <div className="inline-message inline-message--warning">
                      <span>Cliente no encontrado. Desea registrar un nuevo cliente?</span>
                      <Button variant="secondary" type="button" onClick={openInlineRegister}>
                        <Plus size={16} />Registrar cliente
                      </Button>
                    </div>
                  )}

                  {showInlineRegister && registerDraftForm && (
                    <div className="summary-block">
                      <SectionHeader
                        eyebrow=""
                        title="Registrar Nuevo Cliente"
                        description=""
                        actions={<Button variant="ghost" type="button" onClick={() => setShowInlineRegister(false)}>Cancelar</Button>}
                      />

                      <div className="form-grid form-grid--two-cols">
                        <label>
                          Tipo de Cliente
                          <select
                            value={registerDraftForm.tipoCliente}
                            onChange={(event) => {
                              const nextType = event.target.value;
                              setRegisterDraftForm((current) => ({
                                ...current,
                                tipoCliente: nextType,
                                tipoIdentificacion: nextType === 'persona_juridica' ? 'ruc' : current.tipoIdentificacion
                              }));
                            }}
                          >
                            <option value="persona_natural">Persona Natural</option>
                            <option value="persona_juridica">Persona Juridica</option>
                          </select>
                        </label>
                        <label />

                        {registerDraftForm.tipoCliente === 'persona_natural' ? (
                          <>
                            <label>
                              Nombres
                              <input value={registerDraftForm.nombre} placeholder="Ingrese nombres" onChange={(event) => updateRegisterField('nombre', event.target.value)} />
                            </label>
                            <label>
                              Apellidos
                              <input value={registerDraftForm.apellidos} placeholder="Ingrese apellidos" onChange={(event) => updateRegisterField('apellidos', event.target.value)} />
                            </label>
                          </>
                        ) : (
                          <label className="form-grid__full">
                            Razon Social
                            <input value={registerDraftForm.razonSocial} placeholder="Ingrese razon social" onChange={(event) => updateRegisterField('razonSocial', event.target.value)} />
                          </label>
                        )}

                        <label>
                          Tipo de Identificacion
                          <select value={registerDraftForm.tipoIdentificacion} onChange={(event) => updateRegisterField('tipoIdentificacion', event.target.value)}>
                            {registerDraftForm.tipoCliente === 'persona_juridica' ? (
                              <option value="ruc">RUC</option>
                            ) : (
                              <>
                                <option value="cedula">Cedula</option>
                                <option value="pasaporte">Pasaporte</option>
                              </>
                            )}
                          </select>
                        </label>
                        <label>
                          Numero de Identificacion
                          <input value={registerDraftForm.numeroIdentificacion} placeholder="Ingrese numero" onChange={(event) => updateRegisterField('numeroIdentificacion', event.target.value)} />
                        </label>
                        <label className="form-grid__full">
                          Correo Electronico
                          <input value={registerDraftForm.correo} placeholder="correo@ejemplo.com" onChange={(event) => updateRegisterField('correo', event.target.value)} />
                        </label>
                        <label className="form-grid__full">
                          Telefono
                          <input value={registerDraftForm.telefono} placeholder="Ingrese telefono" onChange={(event) => updateRegisterField('telefono', event.target.value)} />
                        </label>
                        <label className="form-grid__full">
                          Direccion
                          <input value={registerDraftForm.direccion} placeholder="Ingrese direccion" onChange={(event) => updateRegisterField('direccion', event.target.value)} />
                        </label>
                      </div>

                      <div className="form-actions">
                        <Button variant="secondary" type="button" onClick={() => setShowInlineRegister(false)}>Cancelar</Button>
                        <Button type="button" onClick={handleSaveInlineClient}>Guardar</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <SectionHeader eyebrow="Paso 3" title="Agregar productos" description="Busca por nombre, codigo o marca y agrega unidades al detalle." />
              <div className="toolbar-grid toolbar-grid--invoice">
                <input className="field" placeholder="Buscar por nombre, codigo o marca..." value={productSearch} onChange={(event) => setProductSearch(event.target.value)} />
              </div>

              <div className="invoice-table">
                <div className="invoice-table__head">
                  <span>Codigo</span>
                  <span>Producto</span>
                  <span>Marca</span>
                  <span>Precio</span>
                  <span>Stock</span>
                  <span />
                </div>
                {filteredProducts.length === 0 ? (
                  <EmptyState title="No hay productos disponibles" description="Verifica el catalogo o ajusta la busqueda." />
                ) : (
                  filteredProducts.map((product) => (
                    <article key={product.id} className="invoice-table__row">
                      <div className="invoice-table__mono">{product.codigo}</div>
                      <div>
                        <strong>{product.nombre}</strong>
                        <p>{product.marca}</p>
                      </div>
                      <div>{product.marca}</div>
                      <div>{formatMoney(product.precio)}</div>
                      <div>{getStockBadge(product)}</div>
                      <div className="invoice-table__action">
                        <Button className="icon-button" type="button" onClick={() => addProductToInvoice(product)} disabled={isOutOfStock(product.stock)}>
                          <Plus size={16} />
                        </Button>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {selectedItems.length > 0 && (
                <div className="summary-block">
                  <span><ShoppingCart size={14} /> Detalle de la factura</span>
                  <div className="invoice-table invoice-table--cart">
                    <div className="invoice-table__head">
                      <span>Producto</span>
                      <span>Cantidad</span>
                      <span>P. unitario</span>
                      <span>Subtotal</span>
                      <span />
                    </div>
                    {selectedItems.map((item) => (
                      <div key={item.productoId} className="invoice-table__row invoice-table__row--cart">
                        <div>
                          <strong>{item.nombre}</strong>
                          <p>{item.codigo} · {item.marca}</p>
                        </div>
                        <div className="cart-list__controls">
                          <Button variant="secondary" className="icon-button" type="button" onClick={() => updateQuantity(item.productoId, item.cantidad - 1)}>
                            <Minus size={16} />
                          </Button>
                          <input type="number" min="1" step="1" value={item.cantidad} onChange={(event) => updateQuantity(item.productoId, event.target.value)} />
                          <Button
                            variant="secondary"
                            className="icon-button"
                            type="button"
                            onClick={() => updateQuantity(item.productoId, item.cantidad + 1)}
                            disabled={item.cantidad >= item.maxStock}
                          >
                            <Plus size={16} />
                          </Button>
                          <button type="button" className="icon-button icon-button--danger" onClick={() => removeItem(item.productoId)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div>{formatMoney(item.precioUnitario)}</div>
                        <div><strong>{formatMoney(item.subtotal)}</strong></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <SectionHeader eyebrow="Paso 4" title="Resumen de factura" description="Revisa cliente, detalle, descuento, IVA y total antes de confirmar." />

              <div className="selected-client-card">
                <Badge tone="neutral">Cliente</Badge>
                <strong>{selectedClient ? formatClientName(selectedClient) : 'Sin cliente'}</strong>
                <p>{selectedClient ? `${formatIdentificationType(selectedClient.tipoIdentificacion)} - ${selectedClient.numeroIdentificacion}` : '-'}</p>
              </div>

              <div className="summary-block">
                <span>Productos incluidos</span>
                {selectedItems.length === 0 ? (
                  <p className="summary-empty">Aun no has agregado productos.</p>
                ) : (
                  <div className="invoice-table invoice-table--cart-readonly">
                    <div className="invoice-table__head">
                      <span>Producto</span>
                      <span>Cant.</span>
                      <span>P. unitario</span>
                      <span>Subtotal</span>
                    </div>
                    {selectedItems.map((item) => (
                      <div key={item.productoId} className="invoice-table__row invoice-table__row--readonly">
                        <div>
                          <strong>{item.nombre}</strong>
                          <p>{item.codigo}</p>
                        </div>
                        <div>{item.cantidad}</div>
                        <div>{formatMoney(item.precioUnitario)}</div>
                        <div><strong>{formatMoney(item.subtotal)}</strong></div>
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
            </Card>
          )}

          {currentStep === 5 && (
            <Card>
              <SectionHeader eyebrow="Paso 5" title="Confirmar emision" description="Verifica los datos finales y emite la factura." />
              <div className="summary-block" style={{ textAlign: 'center' }}>
                <FileText size={44} />
                <strong>Factura lista para emitir</strong>
                <p>Total a facturar: <strong>{formatMoney(total)}</strong></p>
              </div>
              <div className="form-actions">
                <Button type="button" onClick={emitInvoice}>
                  <FileText size={16} />Emitir factura
                </Button>
                <Button variant="secondary" type="button" onClick={resetInvoiceState}>Limpiar flujo</Button>
              </div>
            </Card>
          )}
        </div>

        <div className="invoice-layout__right">
          <Card className="invoice-summary-card">
            <SectionHeader eyebrow="" title="Resumen" description="" />

            <div className="totals-grid">
              <div><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
              <div><span>Descuento</span><strong>{formatMoney(discountApplied)}</strong></div>
              <div><span>IVA</span><strong>{formatMoney(iva)}</strong></div>
              <div className="totals-grid__total"><span>Total</span><strong>{formatMoney(total)}</strong></div>
            </div>

            <div className="summary-block">
              <div>
                <span>Productos:</span>
                <strong>{selectedItems.length}</strong>
              </div>
              <div>
                <span>Unidades:</span>
                <strong>{unitsCount}</strong>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '0.5rem' }}>
              <Button variant="secondary" type="button" onClick={handleBack} disabled={currentStep === 1}>
                <ArrowLeft size={16} />Atras
              </Button>
              {currentStep < 5 ? (
                <Button type="button" onClick={handleNext} disabled={!canProceed()}>
                  Siguiente<ArrowRight size={16} />
                </Button>
              ) : (
                <Button type="button" onClick={emitInvoice} disabled={!flowReady}>
                  Siguiente<ArrowRight size={16} />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </section>

      <Dialog
        open={showSuccessDialog}
        title="Factura Emitida Exitosamente"
        description="La factura ha sido registrada en el sistema"
        onClose={closeSuccessDialog}
        footer={(
          <>
            <Button type="button" onClick={closeSuccessDialog}>Nueva factura</Button>
            <Button variant="secondary" type="button" onClick={goToHistory}>Ver historial</Button>
          </>
        )}
      >
        {lastInvoice && (
          <div className="invoice-preview invoice-preview--compact">
            <div className="invoice-preview__header">
              <div>
                <p className="section-eyebrow">Comprobante</p>
                <strong>{lastInvoice.numeroComprobante}</strong>
                <p>{formatDate(lastInvoice.fecha)}</p>
              </div>
              <Badge tone="success">Emitida</Badge>
            </div>

            <div className="invoice-preview__grid">
              <div>
                <span>Cliente</span>
                <strong>{lastInvoice.clienteNombre}</strong>
              </div>
              <div>
                <span>Identificacion</span>
                <strong>{lastInvoice.clienteIdentificacion}</strong>
              </div>
              <div>
                <span>Items</span>
                <strong>{lastInvoice.items.length}</strong>
              </div>
            </div>

            <div className="invoice-preview__totals">
              <div><span>Subtotal</span><strong>{formatMoney(lastInvoice.subtotal)}</strong></div>
              <div><span>Descuento</span><strong>{formatMoney(lastInvoice.descuento)}</strong></div>
              <div><span>IVA</span><strong>{formatMoney(lastInvoice.iva)}</strong></div>
              <div className="invoice-preview__totals-total"><span>Total</span><strong>{formatMoney(lastInvoice.total)}</strong></div>
            </div>

            <div className="summary-block">
              <span>Vista previa de impresion</span>
              <strong><Printer size={16} /> {settings.nombreNegocio}</strong>
              <p>RUC: {settings.ruc}</p>
              <p>{settings.direccion}</p>
              <p>Tel: {settings.telefono}</p>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
