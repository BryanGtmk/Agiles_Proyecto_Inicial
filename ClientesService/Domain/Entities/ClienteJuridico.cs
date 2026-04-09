namespace ClientesService.Domain.Entities;

public class ClienteJuridico
{
    public int IdCliente { get; set; }
    public string RazonSocial { get; set; } = string.Empty;

    public Cliente Cliente { get; set; } = default!;
}
