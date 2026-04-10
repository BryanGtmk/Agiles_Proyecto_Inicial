import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Power } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { formatMoney } from '../lib/formatters';
import { isLowStock, isOutOfStock } from '../lib/validators';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import SectionHeader from '../components/ui/SectionHeader';
import ProductFormDialog from '../components/forms/ProductFormDialog';

export default function ProductosPage() {
  const { products, addProduct, toggleProductStatus } = useAppContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [stockFilter, setStockFilter] = useState('todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => (statusFilter === 'todos' ? true : product.estado === statusFilter))
      .filter((product) => {
        if (stockFilter === 'bajo') return isLowStock(product.stock);
        if (stockFilter === 'sin') return isOutOfStock(product.stock);
        return true;
      })
      .filter((product) => {
        const text = `${product.codigo} ${product.nombre} ${product.marca}`.toLowerCase();
        return text.includes(search.toLowerCase());
      });
  }, [products, search, statusFilter, stockFilter]);

  function openCreateDialog() {
    setEditingProduct(null);
    setDialogOpen(true);
  }

  function openEditDialog(product) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  function handleSave(payload) {
    addProduct({
      ...payload,
      id: editingProduct?.id
    });

    toast.success(editingProduct ? 'Producto actualizado correctamente.' : 'Producto registrado correctamente.');

    setDialogOpen(false);
    setEditingProduct(null);
  }

  return (
    <div className="page-stack">
      <Card>
        <SectionHeader
          eyebrow="Modulo de productos"
          title="Gestion de productos"
          description="Busca, filtra, crea y edita el catalogo con control de stock y estado."
          actions={<Button onClick={openCreateDialog}><Plus size={16} />Nuevo producto</Button>}
        />

        <div className="toolbar-grid">
          <input className="field" placeholder="Buscar por codigo, nombre o marca" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <select className="field" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
            <option value="todos">Todo el stock</option>
            <option value="bajo">Stock bajo</option>
            <option value="sin">Sin stock</option>
          </select>
        </div>

        <div className="table-wrap">
          {visibleProducts.length === 0 ? (
            <EmptyState
              title="No hay productos que mostrar"
              description="Revisa los filtros o registra un producto nuevo."
              actionLabel="Nuevo producto"
              onAction={openCreateDialog}
            />
          ) : (
            <table className="app-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.codigo}</td>
                    <td>{product.nombre}</td>
                    <td>{product.marca}</td>
                    <td>{formatMoney(product.precio)}</td>
                    <td>
                      <Badge tone={isOutOfStock(product.stock) ? 'danger' : isLowStock(product.stock) ? 'warning' : 'success'}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td><Badge tone={product.estado === 'activo' ? 'success' : 'danger'}>{product.estado}</Badge></td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" className="icon-button" onClick={() => setSelectedProduct(product)} type="button"><Eye size={16} /></Button>
                        <Button variant="ghost" className="icon-button" onClick={() => openEditDialog(product)} type="button"><Pencil size={16} /></Button>
                        <Button
                          variant="ghost"
                          className="icon-button"
                          onClick={() => {
                            toggleProductStatus(product.id);
                            toast.success('Estado del producto actualizado.');
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

      <ProductFormDialog
        open={dialogOpen}
        product={editingProduct}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      {selectedProduct && (
        <Card className="detail-card">
          <SectionHeader eyebrow="Detalle" title={selectedProduct.nombre} description="Informacion completa del producto seleccionado." actions={<Button variant="ghost" onClick={() => setSelectedProduct(null)}>Cerrar</Button>} />
          <div className="detail-grid">
            <div><span>Codigo</span><strong>{selectedProduct.codigo}</strong></div>
            <div><span>Marca</span><strong>{selectedProduct.marca}</strong></div>
            <div><span>Precio</span><strong>{formatMoney(selectedProduct.precio)}</strong></div>
            <div><span>Stock</span><strong>{selectedProduct.stock}</strong></div>
            <div><span>Estado</span><strong>{selectedProduct.estado}</strong></div>
          </div>
        </Card>
      )}
    </div>
  );
}
