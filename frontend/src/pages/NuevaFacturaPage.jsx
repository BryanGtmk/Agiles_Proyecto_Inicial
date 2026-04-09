import { useEffect, useMemo, useState } from "react";
import ClienteSelector from "../components/ClienteSelector";
import ClienteNaturalForm from "../components/ClienteNaturalForm";
import ClienteJuridicoForm from "../components/ClienteJuridicoForm";
import ProductoList from "../components/ProductoList";
import FacturaDetalleTable from "../components/FacturaDetalleTable";
import FacturaResumen from "../components/FacturaResumen";
import ConfirmacionFactura from "../components/ConfirmacionFactura";
import { CONSUMIDOR_FINAL, IDENTIFICACIONES_JURIDICA, IDENTIFICACIONES_NATURAL, TIPO_FACTURACION, TIPOS_PERSONA } from "../constants/catalogs";
import { buscarClientePorIdentificacion, registrarClienteJuridico, registrarClienteNatural } from "../services/clientesService";
import { crearFactura, listarProductos } from "../services/procesosService";

const initialNaturalForm = {
  nombres: "",
  apellidos: "",
  correo: "",
  telefono: "",
  direccion: ""
};

const initialJuridicoForm = {
  razonSocial: "",
  correo: "",
  telefono: "",
  direccion: ""
};

export default function NuevaFacturaPage() {
  const [tipoFacturacion, setTipoFacturacion] = useState(TIPO_FACTURACION.CONSUMIDOR_FINAL);
  const [tipoPersona, setTipoPersona] = useState(TIPOS_PERSONA.NATURAL);
  const [tipoIdentificacion, setTipoIdentificacion] = useState(IDENTIFICACIONES_NATURAL[0]);
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(CONSUMIDOR_FINAL);
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [productos, setProductos] = useState([]);
  const [detallesFactura, setDetallesFactura] = useState([]);
  const [descuento, setDescuento] = useState(0);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [loadingRegistro, setLoadingRegistro] = useState(false);
  const [loadingFactura, setLoadingFactura] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [errorRegistro, setErrorRegistro] = useState("");
  const [errorFactura, setErrorFactura] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);
  const [naturalForm, setNaturalForm] = useState(initialNaturalForm);
  const [juridicoForm, setJuridicoForm] = useState(initialJuridicoForm);

  const clienteListo = Boolean(clienteSeleccionado);

  const identificacionesDisponibles = useMemo(() => {
    return tipoPersona === TIPOS_PERSONA.NATURAL ? IDENTIFICACIONES_NATURAL : IDENTIFICACIONES_JURIDICA;
  }, [tipoPersona]);

  const subtotal = useMemo(() => {
    return detallesFactura.reduce((totalAcumulado, item) => totalAcumulado + item.subtotalLinea, 0);
  }, [detallesFactura]);

  const descuentoAplicado = useMemo(() => Math.min(Math.max(Number(descuento) || 0, 0), subtotal), [descuento, subtotal]);
  const baseImponible = useMemo(() => subtotal - descuentoAplicado, [subtotal, descuentoAplicado]);
  const iva = useMemo(() => baseImponible * 0.15, [baseImponible]);
  const total = useMemo(() => baseImponible + iva, [baseImponible, iva]);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (tipoFacturacion === TIPO_FACTURACION.CONSUMIDOR_FINAL) {
      setClienteSeleccionado(CONSUMIDOR_FINAL);
      setClienteEncontrado(null);
      setMostrarRegistro(false);
      setErrorBusqueda("");
      setErrorRegistro("");
    } else {
      setClienteSeleccionado(null);
      setConfirmacion(null);
    }
  }, [tipoFacturacion]);

  function cambiarTipoFacturacion(valor) {
    setTipoFacturacion(valor);
    setConfirmacion(null);
    setErrorGeneral("");
    setErrorBusqueda("");
    setErrorRegistro("");
    setErrorFactura("");
    setDetallesFactura([]);
    setDescuento(0);

    if (valor === TIPO_FACTURACION.CONSUMIDOR_FINAL) {
      setClienteSeleccionado(CONSUMIDOR_FINAL);
      setClienteEncontrado(null);
      setMostrarRegistro(false);
      return;
    }

    setClienteSeleccionado(null);
    setClienteEncontrado(null);
    setMostrarRegistro(false);
    resetRegistro();
  }

  useEffect(() => {
    if (!identificacionesDisponibles.includes(tipoIdentificacion)) {
      setTipoIdentificacion(identificacionesDisponibles[0]);
    }
  }, [identificacionesDisponibles, tipoIdentificacion]);

  async function cargarProductos() {
    try {
      setLoadingProductos(true);
      setErrorGeneral("");
      const data = await listarProductos();
      setProductos(data.filter((producto) => producto.activo));
    } catch (error) {
      setErrorGeneral(error.message || "No se pudieron cargar los productos.");
    } finally {
      setLoadingProductos(false);
    }
  }

  function resetRegistro() {
    setNaturalForm(initialNaturalForm);
    setJuridicoForm(initialJuridicoForm);
    setErrorRegistro("");
  }

  async function handleBuscarCliente() {
    try {
      setLoadingCliente(true);
      setErrorBusqueda("");
      setErrorGeneral("");
      setConfirmacion(null);
      setClienteEncontrado(null);
      setClienteSeleccionado(null);
      setMostrarRegistro(false);

      const numero = numeroIdentificacion.trim();
      if (!numero) {
        setErrorBusqueda("Ingrese un numero de identificacion.");
        return;
      }

      const cliente = await buscarClientePorIdentificacion(tipoIdentificacion, numero);
      if (cliente) {
        setClienteEncontrado(cliente);
        setClienteSeleccionado({
          idCliente: cliente.idCliente,
          tipoIdentificacionFiscal: cliente.tipoIdentificacionFiscal,
          numeroIdentificacion: cliente.numeroIdentificacion,
          nombreClienteFactura: cliente.nombreClienteFactura
        });
        setMostrarRegistro(false);
      } else {
        setClienteEncontrado(null);
        setMostrarRegistro(true);
        resetRegistro();
      }
    } catch (error) {
      setErrorBusqueda(error.message || "No se pudo buscar el cliente.");
    } finally {
      setLoadingCliente(false);
    }
  }

  async function handleRegistrarClienteNatural() {
    try {
      setLoadingRegistro(true);
      setErrorRegistro("");
      setErrorGeneral("");

      if (!naturalForm.nombres.trim() || !naturalForm.apellidos.trim()) {
        setErrorRegistro("Nombres y apellidos son obligatorios.");
        return;
      }

      const cliente = await registrarClienteNatural({
        tipoPersona: TIPOS_PERSONA.NATURAL,
        tipoIdentificacionFiscal: tipoIdentificacion,
        numeroIdentificacion: numeroIdentificacion.trim(),
        ...naturalForm
      });

      setClienteEncontrado(cliente);
      setClienteSeleccionado({
        idCliente: cliente.idCliente,
        tipoIdentificacionFiscal: cliente.tipoIdentificacionFiscal,
        numeroIdentificacion: cliente.numeroIdentificacion,
        nombreClienteFactura: cliente.nombreClienteFactura
      });
      setMostrarRegistro(false);
      setConfirmacion(null);
    } catch (error) {
      setErrorRegistro(error.message || "No se pudo registrar el cliente natural.");
    } finally {
      setLoadingRegistro(false);
    }
  }

  async function handleRegistrarClienteJuridico() {
    try {
      setLoadingRegistro(true);
      setErrorRegistro("");
      setErrorGeneral("");

      if (!juridicoForm.razonSocial.trim()) {
        setErrorRegistro("La razon social es obligatoria.");
        return;
      }

      const cliente = await registrarClienteJuridico({
        tipoPersona: TIPOS_PERSONA.JURIDICA,
        tipoIdentificacionFiscal: tipoIdentificacion,
        numeroIdentificacion: numeroIdentificacion.trim(),
        ...juridicoForm
      });

      setClienteEncontrado(cliente);
      setClienteSeleccionado({
        idCliente: cliente.idCliente,
        tipoIdentificacionFiscal: cliente.tipoIdentificacionFiscal,
        numeroIdentificacion: cliente.numeroIdentificacion,
        nombreClienteFactura: cliente.nombreClienteFactura
      });
      setMostrarRegistro(false);
      setConfirmacion(null);
    } catch (error) {
      setErrorRegistro(error.message || "No se pudo registrar el cliente juridico.");
    } finally {
      setLoadingRegistro(false);
    }
  }

  function agregarProducto(producto) {
    setErrorFactura("");
    setConfirmacion(null);

    if (!producto.activo) {
      setErrorFactura("El producto seleccionado esta inactivo.");
      return;
    }

    if (producto.stock < 1) {
      setErrorFactura("El producto no tiene stock disponible.");
      return;
    }

    setDetallesFactura((actual) => {
      const existente = actual.find((detalle) => detalle.idProducto === producto.idProducto);
      if (existente) {
        if (existente.cantidad + 1 > producto.stock) {
          setErrorFactura(`No hay stock suficiente para ${producto.nombre}.`);
          return actual;
        }

        return actual.map((detalle) =>
          detalle.idProducto === producto.idProducto
            ? {
                ...detalle,
                cantidad: detalle.cantidad + 1,
                subtotalLinea: (detalle.cantidad + 1) * detalle.precioUnitario
              }
            : detalle
        );
      }

      return [
        ...actual,
        {
          idProducto: producto.idProducto,
          codigoProducto: producto.codigoProducto,
          descripcionProducto: producto.nombre,
          cantidad: 1,
          precioUnitario: producto.precio,
          subtotalLinea: producto.precio
        }
      ];
    });
  }

  function cambiarCantidad(idProducto, value) {
    setErrorFactura("");
    const cantidad = Number(value);

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      setDetallesFactura((actual) => actual.filter((detalle) => detalle.idProducto !== idProducto));
      return;
    }

    setDetallesFactura((actual) => {
      const producto = productos.find((item) => item.idProducto === idProducto);
      if (!producto || cantidad > producto.stock) {
        setErrorFactura(`No hay stock suficiente para ${producto?.nombre || "el producto"}.`);
        return actual;
      }

      return actual.map((detalle) =>
        detalle.idProducto === idProducto
          ? {
              ...detalle,
              cantidad,
              subtotalLinea: cantidad * detalle.precioUnitario
            }
          : detalle
      );
    });
  }

  function eliminarDetalle(idProducto) {
    setDetallesFactura((actual) => actual.filter((detalle) => detalle.idProducto !== idProducto));
  }

  async function handleEmitirFactura() {
    try {
      setLoadingFactura(true);
      setErrorFactura("");
      setErrorGeneral("");
      setConfirmacion(null);

      if (!clienteSeleccionado) {
        setErrorFactura("Seleccione o registre un cliente antes de emitir la factura.");
        return;
      }

      if (detallesFactura.length === 0) {
        setErrorFactura("Agregue al menos un producto al detalle.");
        return;
      }

      const payload = {
        idCliente: clienteSeleccionado.idCliente,
        tipoIdentificacionComprador: clienteSeleccionado.tipoIdentificacionFiscal,
        identificacionComprador: clienteSeleccionado.numeroIdentificacion,
        nombreClienteFactura: clienteSeleccionado.nombreClienteFactura,
        descuento: descuentoAplicado,
        detalles: detallesFactura.map((detalle) => ({
          idProducto: detalle.idProducto,
          cantidad: detalle.cantidad
        }))
      };

      const factura = await crearFactura(payload);
      setConfirmacion(factura);
      setDetallesFactura([]);
      setDescuento(0);
      await cargarProductos();
    } catch (error) {
      setErrorFactura(error.message || "No se pudo emitir la factura.");
    } finally {
      setLoadingFactura(false);
    }
  }

  return (
    <main className="invoice-page">
      <header className="page-hero">
        <div>
          <p className="eyebrow">Ferreteria</p>
          <h1>Modulo de facturacion</h1>
          <p className="hero-copy">
            Flujo de facturacion claro, con busqueda de cliente, detalle de productos y confirmacion final.
          </p>
        </div>
      </header>

      {errorGeneral && <div className="global-alert error">{errorGeneral}</div>}

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>Flujo de negocio</h2>
            <p>El sistema avanza de forma secuencial: cliente, productos, detalle y emision.</p>
          </div>
        </div>

        <div className="flow-steps">
          <div className={tipoFacturacion ? "flow-step done" : "flow-step"}>1. Nueva factura</div>
          <div className="flow-step done">2. Tipo de facturacion</div>
          <div className={clienteListo ? "flow-step done" : "flow-step"}>3. Cliente listo</div>
          <div className={clienteListo ? "flow-step done" : "flow-step"}>4. Productos y detalle</div>
          <div className={clienteListo && detallesFactura.length > 0 ? "flow-step done" : "flow-step"}>5. Totales</div>
          <div className={confirmacion ? "flow-step done" : "flow-step"}>6. Factura emitida</div>
        </div>
      </section>

      <ClienteSelector
        tipoFacturacion={tipoFacturacion}
        onChangeTipoFacturacion={cambiarTipoFacturacion}
        tipoPersona={tipoPersona}
        onChangeTipoPersona={(value) => setTipoPersona(value)}
        tipoIdentificacion={tipoIdentificacion}
        onChangeTipoIdentificacion={(value) => setTipoIdentificacion(value)}
        numeroIdentificacion={numeroIdentificacion}
        onChangeNumeroIdentificacion={setNumeroIdentificacion}
        onBuscarCliente={handleBuscarCliente}
        identificacionesDisponibles={identificacionesDisponibles}
        errorBusqueda={errorBusqueda}
        loadingCliente={loadingCliente}
        clienteEncontrado={clienteEncontrado}
        clienteSeleccionado={clienteSeleccionado}
        onUsarConsumidorFinal={() => {
          cambiarTipoFacturacion(TIPO_FACTURACION.CONSUMIDOR_FINAL);
        }}
      />

      <ClienteNaturalForm
        visible={mostrarRegistro && tipoPersona === TIPOS_PERSONA.NATURAL}
        formData={naturalForm}
        onChange={(event) => {
          const { name, value } = event.target;
          setNaturalForm((actual) => ({ ...actual, [name]: value }));
        }}
        onSubmit={handleRegistrarClienteNatural}
        loading={loadingRegistro}
        error={errorRegistro}
      />

      <ClienteJuridicoForm
        visible={mostrarRegistro && tipoPersona === TIPOS_PERSONA.JURIDICA}
        formData={juridicoForm}
        onChange={(event) => {
          const { name, value } = event.target;
          setJuridicoForm((actual) => ({ ...actual, [name]: value }));
        }}
        onSubmit={handleRegistrarClienteJuridico}
        loading={loadingRegistro}
        error={errorRegistro}
      />

      {clienteListo ? (
        <>
          <ProductoList
            productos={productos}
            onAgregarProducto={agregarProducto}
            loading={loadingProductos}
            error={null}
          />

          <FacturaDetalleTable
            detalles={detallesFactura}
            onChangeCantidad={cambiarCantidad}
            onEliminarDetalle={eliminarDetalle}
          />

          <FacturaResumen
            subtotal={subtotal}
            descuento={descuentoAplicado}
            iva={iva}
            total={total}
            descuentoInput={descuento}
            onChangeDescuento={(event) => setDescuento(event.target.value)}
            onEmitirFactura={handleEmitirFactura}
            loading={loadingFactura}
          />

          <ConfirmacionFactura factura={confirmacion} error={errorFactura} />
        </>
      ) : (
        <section className="panel">
          <div className="inline-message info">Seleccione el tipo de facturacion para continuar con clientes y productos.</div>
        </section>
      )}
    </main>
  );
}
