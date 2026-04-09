using ProcesosService.Application.DTOs;

namespace ProcesosService.Application.Interfaces;

public interface IProductosService
{
    Task<IReadOnlyCollection<ProductoResponseDto>> ObtenerTodosAsync(CancellationToken cancellationToken = default);
    Task<ProductoResponseDto> CrearAsync(CrearProductoDto dto, CancellationToken cancellationToken = default);
    Task<ProductoResponseDto> ActualizarAsync(int idProducto, ActualizarProductoDto dto, CancellationToken cancellationToken = default);
}
