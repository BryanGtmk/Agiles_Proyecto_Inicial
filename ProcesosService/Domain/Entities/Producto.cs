namespace ProcesosService.Domain.Entities;

public class Producto
{
    public int IdProducto { get; set; }
    public string CodigoProducto { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int Stock { get; set; }
    public bool Activo { get; set; }

    public ICollection<CompraDetalle> ComprasDetalle { get; set; } = new List<CompraDetalle>();
}
