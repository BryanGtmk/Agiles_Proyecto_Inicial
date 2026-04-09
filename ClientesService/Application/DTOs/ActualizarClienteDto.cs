using System.ComponentModel.DataAnnotations;

namespace ClientesService.Application.DTOs;

public class ActualizarClienteDto
{
    [EmailAddress]
    [StringLength(150)]
    public string? Correo { get; set; }

    [StringLength(20)]
    public string? Telefono { get; set; }

    [StringLength(300)]
    public string? Direccion { get; set; }

    public bool Estado { get; set; }
}
