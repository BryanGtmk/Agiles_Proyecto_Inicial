"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  mockClientes,
  mockProductos,
  mockFacturas,
  mockConfiguracion,
  consumidorFinal,
  type Cliente,
  type Producto,
  type Factura,
  type Configuracion,
  type ItemFactura
} from "./mock-data"

interface StoreContextType {
  // Clientes
  clientes: Cliente[]
  addCliente: (cliente: Omit<Cliente, "id">) => Cliente
  updateCliente: (id: string, cliente: Partial<Cliente>) => void
  getClienteById: (id: string) => Cliente | undefined
  getClienteByIdentificacion: (identificacion: string) => Cliente | undefined
  
  // Productos
  productos: Producto[]
  addProducto: (producto: Omit<Producto, "id">) => Producto
  updateProducto: (id: string, producto: Partial<Producto>) => void
  getProductoById: (id: string) => Producto | undefined
  getProductoByCodigo: (codigo: string) => Producto | undefined
  
  // Facturas
  facturas: Factura[]
  addFactura: (factura: Omit<Factura, "id" | "numeroComprobante">) => Factura
  getFacturaById: (id: string) => Factura | undefined
  
  // Configuración
  configuracion: Configuracion
  updateConfiguracion: (config: Partial<Configuracion>) => void
  
  // Consumidor final
  consumidorFinal: Cliente
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes)
  const [productos, setProductos] = useState<Producto[]>(mockProductos)
  const [facturas, setFacturas] = useState<Factura[]>(mockFacturas)
  const [configuracion, setConfiguracion] = useState<Configuracion>(mockConfiguracion)
  const [facturaCounter, setFacturaCounter] = useState(126)

  // Clientes
  const addCliente = useCallback((cliente: Omit<Cliente, "id">) => {
    const newCliente: Cliente = {
      ...cliente,
      id: `cli-${Date.now()}`
    }
    setClientes(prev => [...prev, newCliente])
    return newCliente
  }, [])

  const updateCliente = useCallback((id: string, updates: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const getClienteById = useCallback((id: string) => {
    return clientes.find(c => c.id === id)
  }, [clientes])

  const getClienteByIdentificacion = useCallback((identificacion: string) => {
    return clientes.find(c => c.numeroIdentificacion === identificacion)
  }, [clientes])

  // Productos
  const addProducto = useCallback((producto: Omit<Producto, "id">) => {
    const newProducto: Producto = {
      ...producto,
      id: `prod-${Date.now()}`
    }
    setProductos(prev => [...prev, newProducto])
    return newProducto
  }, [])

  const updateProducto = useCallback((id: string, updates: Partial<Producto>) => {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const getProductoById = useCallback((id: string) => {
    return productos.find(p => p.id === id)
  }, [productos])

  const getProductoByCodigo = useCallback((codigo: string) => {
    return productos.find(p => p.codigo.toLowerCase() === codigo.toLowerCase())
  }, [productos])

  // Facturas
  const addFactura = useCallback((factura: Omit<Factura, "id" | "numeroComprobante">) => {
    const numeroComprobante = `${configuracion.prefijoFactura}-${String(facturaCounter).padStart(9, "0")}`
    const newFactura: Factura = {
      ...factura,
      id: `fac-${Date.now()}`,
      numeroComprobante
    }
    setFacturas(prev => [newFactura, ...prev])
    setFacturaCounter(prev => prev + 1)
    
    // Update product stock
    factura.items.forEach((item: ItemFactura) => {
      const producto = productos.find(p => p.id === item.productoId)
      if (producto) {
        updateProducto(producto.id, { stock: producto.stock - item.cantidad })
      }
    })
    
    return newFactura
  }, [configuracion.prefijoFactura, facturaCounter, productos, updateProducto])

  const getFacturaById = useCallback((id: string) => {
    return facturas.find(f => f.id === id)
  }, [facturas])

  // Configuración
  const updateConfiguracion = useCallback((config: Partial<Configuracion>) => {
    setConfiguracion(prev => ({ ...prev, ...config }))
  }, [])

  return (
    <StoreContext.Provider
      value={{
        clientes,
        addCliente,
        updateCliente,
        getClienteById,
        getClienteByIdentificacion,
        productos,
        addProducto,
        updateProducto,
        getProductoById,
        getProductoByCodigo,
        facturas,
        addFactura,
        getFacturaById,
        configuracion,
        updateConfiguracion,
        consumidorFinal
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
