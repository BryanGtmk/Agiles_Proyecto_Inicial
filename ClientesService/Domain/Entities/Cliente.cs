using ClientesService.Domain.Enums;

namespace ClientesService.Domain.Entities;

// Entidad raíz de cliente. Guarda datos comunes y enlaza al subtipo Natural/Jurídica.
public class Cliente
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

    // Relación 1:1 para datos específicos de persona natural.
    public ClienteNatural? ClienteNatural { get; set; }
    // Relación 1:1 para datos específicos de persona jurídica.
    public ClienteJuridico? ClienteJuridico { get; set; }
}
