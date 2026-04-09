using ProcesosService.Domain.Entities;

namespace ProcesosService.Application.Interfaces;

public interface IFacturasRepository
{
    Task<CompraCabecera> CrearAsync(CompraCabecera compra, CancellationToken cancellationToken = default);
    Task<CompraCabecera?> ObtenerPorIdAsync(int idCompra, CancellationToken cancellationToken = default);
}
