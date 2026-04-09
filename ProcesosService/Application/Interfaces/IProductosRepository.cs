using ProcesosService.Domain.Entities;

namespace ProcesosService.Application.Interfaces;

public interface IProductosRepository
{
    Task<List<Producto>> ObtenerTodosAsync(CancellationToken cancellationToken = default);
    Task<Producto?> ObtenerPorIdAsync(int idProducto, CancellationToken cancellationToken = default);
    Task<List<Producto>> ObtenerPorIdsAsync(IEnumerable<int> idsProductos, CancellationToken cancellationToken = default);
    Task<Producto> CrearAsync(Producto producto, CancellationToken cancellationToken = default);
    Task<Producto> ActualizarAsync(Producto producto, CancellationToken cancellationToken = default);
}
