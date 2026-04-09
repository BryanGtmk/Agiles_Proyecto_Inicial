using System.ComponentModel.DataAnnotations;

namespace ProcesosService.Application.DTOs;

// DTO principal de emisión de factura.
public class FacturaCreateDto
{
    [Range(1, int.MaxValue)]
    public int IdCliente { get; set; }

    [Required]
    [StringLength(40)]
    public string TipoIdentificacionComprador { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string IdentificacionComprador { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string NombreClienteFactura { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "El descuento no puede ser negativo.")]
    public decimal Descuento { get; set; }

    [Required]
    [MinLength(1)]
    // El backend usa esta lista para validar stock y calcular importes.
    public List<FacturaDetalleCreateDto> Detalles { get; set; } = new();
}

// Línea de factura recibida desde frontend.
public class FacturaDetalleCreateDto
{
    [Range(1, int.MaxValue)]
    public int IdProducto { get; set; }

    [Range(1, int.MaxValue)]
    public int Cantidad { get; set; }
}

// DTO de salida con cabecera y detalle calculados en backend.
public class FacturaResponseDto
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
    public string Estado { get; set; } = string.Empty;
    public List<FacturaDetalleResponseDto> Detalles { get; set; } = new();
}

// DTO de salida por cada línea persistida.
public class FacturaDetalleResponseDto
{
    public int IdProducto { get; set; }
    public string CodigoProducto { get; set; } = string.Empty;
    public string DescripcionProducto { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal SubtotalLinea { get; set; }
}
