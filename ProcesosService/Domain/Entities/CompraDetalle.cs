namespace ProcesosService.Domain.Entities;

public class CompraDetalle
{
    public int IdDetalle { get; set; }
    public int IdCompra { get; set; }
    public int IdProducto { get; set; }
    public string CodigoProducto { get; set; } = string.Empty;
    public string DescripcionProducto { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal SubtotalLinea { get; set; }

    public CompraCabecera CompraCabecera { get; set; } = default!;
    public Producto Producto { get; set; } = default!;
}
