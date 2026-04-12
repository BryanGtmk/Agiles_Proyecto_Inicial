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

// DTO de entrada para generar PDF de factura (preview/descarga).
public class FacturaPdfRequestDto
{
    [Required]
    [StringLength(150)]
    public string NombreNegocio { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string RucNegocio { get; set; } = string.Empty;

    [Required]
    [StringLength(250)]
    public string DireccionNegocio { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string TelefonoNegocio { get; set; } = string.Empty;

    [Required]
    [StringLength(60)]
    public string NumeroComprobante { get; set; } = string.Empty;

    public DateTime FechaEmision { get; set; }

    [Required]
    [StringLength(200)]
    public string NombreClienteFactura { get; set; } = string.Empty;

    [Required]
    [StringLength(40)]
    public string TipoIdentificacionComprador { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string IdentificacionComprador { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Subtotal { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Descuento { get; set; }

    [Range(0, double.MaxValue)]
    public decimal IVA { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Total { get; set; }

    [Required]
    [StringLength(30)]
    public string Estado { get; set; } = "Emitida";

    [Required]
    [MinLength(1)]
    public List<FacturaPdfDetalleDto> Detalles { get; set; } = new();
}

public class FacturaPdfDetalleDto
{
    [Required]
    [StringLength(40)]
    public string CodigoProducto { get; set; } = string.Empty;

    [Required]
    [StringLength(250)]
    public string DescripcionProducto { get; set; } = string.Empty;

    [StringLength(120)]
    public string MarcaProducto { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Cantidad { get; set; }

    [Range(0, double.MaxValue)]
    public decimal PrecioUnitario { get; set; }

    [Range(0, double.MaxValue)]
    public decimal SubtotalLinea { get; set; }
}
