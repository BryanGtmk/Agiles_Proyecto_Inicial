namespace ClientesService.Domain.Entities;

public class ClienteNatural
{
    public int IdCliente { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;

    public Cliente Cliente { get; set; } = default!;
}
