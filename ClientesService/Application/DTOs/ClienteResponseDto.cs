using ClientesService.Domain.Enums;

namespace ClientesService.Application.DTOs;

public class ClienteResponseDto
{
    public int IdCliente { get; set; }
    public TipoPersona TipoPersona { get; set; }
    public TipoIdentificacionFiscal TipoIdentificacionFiscal { get; set; }
    public string NumeroIdentificacion { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public DateTime FechaRegistro { get; set; }
    public bool Estado { get; set; }
    public string NombreClienteFactura { get; set; } = string.Empty;
}
