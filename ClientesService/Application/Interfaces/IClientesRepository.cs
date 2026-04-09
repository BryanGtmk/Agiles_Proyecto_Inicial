using ClientesService.Domain.Entities;
using ClientesService.Domain.Enums;

namespace ClientesService.Application.Interfaces;

public interface IClientesRepository
{
    Task<Cliente?> BuscarPorIdentificacionAsync(TipoIdentificacionFiscal tipoIdentificacion, string numero, CancellationToken cancellationToken = default);
    Task<Cliente?> ObtenerPorIdAsync(int idCliente, CancellationToken cancellationToken = default);
    Task<Cliente> CrearAsync(Cliente cliente, CancellationToken cancellationToken = default);
    Task<Cliente> ActualizarAsync(Cliente cliente, CancellationToken cancellationToken = default);
    Task<bool> ExisteIdentificacionAsync(TipoIdentificacionFiscal tipoIdentificacion, string numero, CancellationToken cancellationToken = default);
}
