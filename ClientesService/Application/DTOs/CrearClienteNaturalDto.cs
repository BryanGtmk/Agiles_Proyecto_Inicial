using System.ComponentModel.DataAnnotations;
using ClientesService.Domain.Enums;

namespace ClientesService.Application.DTOs;

// DTO de entrada para crear un cliente natural.
public class CrearClienteNaturalDto
{
    [Required]
    public TipoPersona TipoPersona { get; set; }

    [Required]
    public TipoIdentificacionFiscal TipoIdentificacionFiscal { get; set; }

    [Required]
    [StringLength(20, MinimumLength = 3)]
    public string NumeroIdentificacion { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Nombres { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Apellidos { get; set; } = string.Empty;

    [EmailAddress]
    [StringLength(150)]
    public string? Correo { get; set; }

    [StringLength(20)]
    public string? Telefono { get; set; }

    [StringLength(300)]
    public string? Direccion { get; set; }
}
