using System.ComponentModel.DataAnnotations;

namespace ProcesosService.Application.DTOs;

// DTO de lectura para catálogo de productos.
public class ProductoResponseDto
{
    public int IdProducto { get; set; }
    public string CodigoProducto { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int Stock { get; set; }
    public bool Activo { get; set; }
}

// DTO para alta de productos.
public class CrearProductoDto
{
    [Required]
    [StringLength(30)]
    public string CodigoProducto { get; set; } = string.Empty;

    [Required]
    [StringLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Marca { get; set; } = string.Empty;

    [Range(0.01, 999999)]
    public decimal Precio { get; set; }

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }

    public bool Activo { get; set; } = true;
}

// DTO para edición de productos existentes.
public class ActualizarProductoDto
{
    [Required]
    [StringLength(30)]
    public string CodigoProducto { get; set; } = string.Empty;

    [Required]
    [StringLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Marca { get; set; } = string.Empty;

    [Range(0.01, 999999)]
    public decimal Precio { get; set; }

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }

    public bool Activo { get; set; }
}
