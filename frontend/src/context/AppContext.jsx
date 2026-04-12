import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { buildInitialInvoices, initialClients, initialProducts, initialSettings } from '../lib/mockData';
import { calculateSubtotal, calculateTotal } from '../lib/invoiceMath';
import { formatClientName, formatInvoiceNumber } from '../lib/formatters';
import { getIdentificationValidationError, isLowStock, normalizeProductCode, validateEmail, validateRuc } from '../lib/validators';

const STORAGE_KEY = 'ferreteria-admin-state-v1';

const AppContext = createContext(null);

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInitialState() {
  const settings = clone(initialSettings);
  const clients = clone(initialClients);
  const products = clone(initialProducts);
  const invoices = buildInitialInvoices(settings, clients);

  return {
    settings,
    clients,
    products,
    invoices,
    nextInvoiceSequence: 130
  };
}

function loadState() {
  if (typeof window === 'undefined') {
    return createInitialState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(raw);
    const fallback = createInitialState();

    return {
      settings: { ...fallback.settings, ...parsed.settings },
      clients: Array.isArray(parsed.clients) ? parsed.clients : fallback.clients,
      products: Array.isArray(parsed.products) ? parsed.products : fallback.products,
      invoices: Array.isArray(parsed.invoices) ? parsed.invoices : fallback.invoices,
      nextInvoiceSequence: Number(parsed.nextInvoiceSequence || fallback.nextInvoiceSequence)
    };
  } catch {
    return createInitialState();
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'settings/update':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    case 'clients/upsert': {
      const client = action.payload;
      const index = state.clients.findIndex((item) => item.id === client.id);

      if (index >= 0) {
        const nextClients = [...state.clients];
        nextClients[index] = client;
        return { ...state, clients: nextClients };
      }

      return { ...state, clients: [client, ...state.clients] };
    }
    case 'clients/toggleStatus':
      return {
        ...state,
        clients: state.clients.map((client) =>
          client.id === action.payload ? { ...client, estado: client.estado === 'activo' ? 'inactivo' : 'activo' } : client
        )
      };
    case 'products/upsert': {
      const product = action.payload;
      const index = state.products.findIndex((item) => item.id === product.id);

      if (index >= 0) {
        const nextProducts = [...state.products];
        nextProducts[index] = product;
        return { ...state, products: nextProducts };
      }

      return { ...state, products: [product, ...state.products] };
    }
    case 'products/toggleStatus':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload ? { ...product, estado: product.estado === 'activo' ? 'inactivo' : 'activo' } : product
        )
      };
    case 'invoices/create':
      return {
        ...state,
        invoices: [action.payload.invoice, ...state.invoices],
        products: action.payload.products,
        nextInvoiceSequence: action.payload.nextInvoiceSequence
      };
    case 'invoices/cancel':
      return {
        ...state,
        invoices: state.invoices.map((invoice) =>
          invoice.id === action.payload.invoiceId ? { ...invoice, estado: 'anulada' } : invoice
        ),
        products: action.payload.products
      };
    case 'state/reset':
      return createInitialState();
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const consumerFinal = state.clients.find((client) => client.tipoCliente === 'consumidor_final') || state.clients[0];

    function getClientById(id) {
      return state.clients.find((client) => client.id === id) || null;
    }

    function getProductById(id) {
      return state.products.find((product) => product.id === id) || null;
    }

    function searchClient({ tipoIdentificacion, numeroIdentificacion }) {
      const normalizedNumber = String(numeroIdentificacion || '').trim();
      return state.clients.find((client) => client.tipoIdentificacion === tipoIdentificacion && client.numeroIdentificacion === normalizedNumber) || null;
    }

    function addClient(payload) {
      const tipoCliente = payload.tipoCliente;
      const tipoIdentificacion = tipoCliente === 'persona_juridica'
        ? 'ruc'
        : payload.tipoIdentificacion;
      const numeroIdentificacion = String(payload.numeroIdentificacion || '').trim();
      const correo = String(payload.correo || '').trim();

      if (!tipoCliente) {
        throw new Error('Seleccione el tipo de cliente.');
      }

      if (!numeroIdentificacion) {
        throw new Error('La identificacion es obligatoria.');
      }

      if (correo && !validateEmail(correo)) {
        throw new Error('Ingrese un correo valido.');
      }

      const identificationError = getIdentificationValidationError(tipoIdentificacion, numeroIdentificacion);
      if (identificationError) {
        throw new Error(identificationError);
      }

      const duplicate = state.clients.find((client) => client.numeroIdentificacion === numeroIdentificacion && client.id !== payload.id);
      if (duplicate) {
        throw new Error('Ya existe un cliente con esa identificacion.');
      }

      const client = {
        id: payload.id || uid('cliente'),
        tipoCliente,
        tipoIdentificacion,
        numeroIdentificacion,
        nombre: String(payload.nombre || '').trim(),
        apellidos: String(payload.apellidos || '').trim(),
        razonSocial: String(payload.razonSocial || '').trim(),
        correo,
        telefono: String(payload.telefono || '').trim(),
        direccion: String(payload.direccion || '').trim(),
        estado: payload.estado || 'activo'
      };

      dispatch({ type: 'clients/upsert', payload: client });
      return client;
    }

    function toggleClientStatus(clientId) {
      if (clientId === consumerFinal.id) {
        throw new Error('El consumidor final fijo no puede desactivarse.');
      }

      dispatch({ type: 'clients/toggleStatus', payload: clientId });
    }

    function addProduct(payload) {
      const codigo = normalizeProductCode(payload.codigo);
      if (!codigo) {
        throw new Error('El codigo del producto es obligatorio.');
      }

      const precio = Number(payload.precio || 0);
      const stock = Number(payload.stock || 0);

      if (precio <= 0) {
        throw new Error('El precio debe ser mayor que cero.');
      }

      if (!Number.isInteger(stock) || stock < 0) {
        throw new Error('El stock debe ser un entero mayor o igual a cero.');
      }

      const duplicate = state.products.find((product) => product.codigo === codigo && product.id !== payload.id);
      if (duplicate) {
        throw new Error('Ya existe un producto con ese codigo.');
      }

      const product = {
        id: payload.id || uid('prod'),
        codigo,
        nombre: String(payload.nombre || '').trim(),
        marca: String(payload.marca || '').trim(),
        precio,
        stock,
        estado: payload.estado || 'activo'
      };

      dispatch({ type: 'products/upsert', payload: product });
      return product;
    }

    function toggleProductStatus(productId) {
      dispatch({ type: 'products/toggleStatus', payload: productId });
    }

    function createInvoice({ clientId, items, discount }) {
      const client = getClientById(clientId);

      if (!client) {
        throw new Error('Seleccione un cliente valido.');
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Agregue al menos un producto a la factura.');
      }

      const normalizedItems = items.map((item) => {
        const product = getProductById(item.productoId);

        if (!product) {
          throw new Error('Uno de los productos ya no existe.');
        }

        if (product.estado !== 'activo') {
          throw new Error(`El producto ${product.nombre} esta inactivo.`);
        }

        if (item.cantidad > product.stock) {
          throw new Error(`No hay stock suficiente para ${product.nombre}.`);
        }

        return {
          productoId: product.id,
          codigo: product.codigo,
          nombre: product.nombre,
          marca: product.marca,
          cantidad: Number(item.cantidad),
          precioUnitario: Number(product.precio),
          subtotal: Number(product.precio) * Number(item.cantidad)
        };
      });

      const subtotal = calculateSubtotal(normalizedItems);
      const appliedDiscount = Math.min(Math.max(Number(discount || 0), 0), subtotal);
      const totalResult = calculateTotal(subtotal, appliedDiscount, state.settings.iva);
      const invoiceNumber = formatInvoiceNumber(state.settings.prefijoFactura, state.nextInvoiceSequence);
      const now = new Date().toISOString();

      const invoice = {
        id: uid('factura'),
        numeroComprobante: invoiceNumber,
        fecha: now,
        clienteId: client.id,
        clienteNombre: formatClientName(client),
        clienteIdentificacion: client.numeroIdentificacion,
        tipoIdentificacionComprador: client.tipoIdentificacion,
        items: normalizedItems,
        subtotal: totalResult.subtotal,
        descuento: totalResult.descuento,
        iva: totalResult.iva,
        total: totalResult.total,
        estado: 'emitida'
      };

      const nextProducts = state.products.map((product) => {
        const item = normalizedItems.find((detail) => detail.productoId === product.id);

        if (!item) {
          return product;
        }

        return {
          ...product,
          stock: product.stock - item.cantidad
        };
      });

      dispatch({
        type: 'invoices/create',
        payload: {
          invoice,
          products: nextProducts,
          nextInvoiceSequence: state.nextInvoiceSequence + 1
        }
      });

      return invoice;
    }

    function cancelInvoice(invoiceId) {
      const invoice = state.invoices.find((item) => item.id === invoiceId);
      if (!invoice) {
        throw new Error('La factura no existe.');
      }

      if (invoice.estado === 'anulada') {
        throw new Error('La factura ya fue anulada.');
      }

      const restoredProducts = state.products.map((product) => {
        const item = invoice.items.find((detail) => detail.productoId === product.id);
        if (!item) {
          return product;
        }

        return {
          ...product,
          stock: product.stock + item.cantidad
        };
      });

      dispatch({ type: 'invoices/cancel', payload: { invoiceId, products: restoredProducts } });
    }

    function updateSettings(payload) {
      const nextSettings = {
        ...state.settings,
        ...payload
      };

      if (!validateRuc(nextSettings.ruc)) {
        throw new Error('El RUC debe contener 13 digitos.');
      }

      if (!/^\d{3}-\d{3}$/.test(nextSettings.prefijoFactura)) {
        throw new Error('El prefijo de factura debe tener formato 001-001.');
      }

      if (!Number.isFinite(Number(nextSettings.iva)) || Number(nextSettings.iva) < 0) {
        throw new Error('El IVA debe ser numerico y no negativo.');
      }

      dispatch({ type: 'settings/update', payload: nextSettings });
    }

    const dashboardStats = {
      activeClients: state.clients.filter((client) => client.estado === 'activo' && client.tipoCliente !== 'consumidor_final').length,
      activeProducts: state.products.filter((product) => product.estado === 'activo').length,
      invoicesToday: state.invoices.filter((invoice) => invoice.estado === 'emitida' && new Date(invoice.fecha).toDateString() === new Date().toDateString()).length,
      salesToday: state.invoices
        .filter((invoice) => invoice.estado === 'emitida' && new Date(invoice.fecha).toDateString() === new Date().toDateString())
        .reduce((total, invoice) => total + Number(invoice.total || 0), 0)
    };

    const invoiceStats = {
      total: state.invoices.length,
      emitidas: state.invoices.filter((invoice) => invoice.estado === 'emitida').length,
      anuladas: state.invoices.filter((invoice) => invoice.estado === 'anulada').length,
      totalFacturado: state.invoices.reduce((total, invoice) => total + Number(invoice.total || 0), 0)
    };

    const lowStockProducts = state.products.filter((product) => product.estado === 'activo' && isLowStock(product.stock));

    return {
      settings: state.settings,
      clients: state.clients,
      products: state.products,
      invoices: state.invoices,
      nextInvoiceSequence: state.nextInvoiceSequence,
      consumerFinal,
      dashboardStats,
      invoiceStats,
      lowStockProducts,
      searchClient,
      addClient,
      toggleClientStatus,
      addProduct,
      toggleProductStatus,
      createInvoice,
      cancelInvoice,
      updateSettings,
      getClientById,
      getProductById,
      dispatch
    };
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider.');
  }

  return context;
}
