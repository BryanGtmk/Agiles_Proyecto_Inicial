namespace ProcesosService.Domain.Entities;

// Cabecera de factura/compra. El detalle asociado se guarda en ComprasDetalle.
public class CompraCabecera
{
    public int IdCompra { get; set; }
    public DateTime FechaCompra { get; set; }
    public string NumeroComprobante { get; set; } = string.Empty;
    public int IdCliente { get; set; }
    public string TipoIdentificacionComprador { get; set; } = string.Empty;
    public string IdentificacionComprador { get; set; } = string.Empty;
    public string NombreClienteFactura { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Descuento { get; set; }
    public decimal IVA { get; set; }
    public decimal Total { get; set; }
    public string Estado { get; set; } = "Emitida";

    // Relación 1:N con líneas de factura.
    public ICollection<CompraDetalle> Detalles { get; set; } = new List<CompraDetalle>();
}
