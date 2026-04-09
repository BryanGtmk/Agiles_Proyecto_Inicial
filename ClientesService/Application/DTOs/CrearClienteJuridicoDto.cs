using System.ComponentModel.DataAnnotations;
using ClientesService.Domain.Enums;

namespace ClientesService.Application.DTOs;

// DTO de entrada para crear un cliente jurídico.
public class CrearClienteJuridicoDto
{
    [Required]
    public TipoPersona TipoPersona { get; set; }

    [Required]
    public TipoIdentificacionFiscal TipoIdentificacionFiscal { get; set; }

    [Required]
    [StringLength(20, MinimumLength = 3)]
    public string NumeroIdentificacion { get; set; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string RazonSocial { get; set; } = string.Empty;

    [EmailAddress]
    [StringLength(150)]
    public string? Correo { get; set; }

    [StringLength(20)]
    public string? Telefono { get; set; }

    [StringLength(300)]
    public string? Direccion { get; set; }
}
