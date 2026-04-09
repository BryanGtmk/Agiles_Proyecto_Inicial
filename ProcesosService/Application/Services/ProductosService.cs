using ProcesosService.Application.DTOs;
using ProcesosService.Application.Interfaces;
using ProcesosService.Domain.Entities;

namespace ProcesosService.Application.Services;

public class ProductosService : IProductosService
{
    private readonly IProductosRepository _productosRepository;

    public ProductosService(IProductosRepository productosRepository)
    {
        _productosRepository = productosRepository;
    }

    public async Task<IReadOnlyCollection<ProductoResponseDto>> ObtenerTodosAsync(CancellationToken cancellationToken = default)
    {
        var productos = await _productosRepository.ObtenerTodosAsync(cancellationToken);
        return productos.Select(MapToResponse).ToList();
    }

    public async Task<ProductoResponseDto> CrearAsync(CrearProductoDto dto, CancellationToken cancellationToken = default)
    {
        var producto = new Producto
        {
            CodigoProducto = dto.CodigoProducto.Trim(),
            Nombre = dto.Nombre.Trim(),
            Marca = dto.Marca.Trim(),
            Precio = dto.Precio,
            Stock = dto.Stock,
            Activo = dto.Activo
        };

        var creado = await _productosRepository.CrearAsync(producto, cancellationToken);
        return MapToResponse(creado);
    }

    public async Task<ProductoResponseDto> ActualizarAsync(int idProducto, ActualizarProductoDto dto, CancellationToken cancellationToken = default)
    {
        var producto = await _productosRepository.ObtenerPorIdAsync(idProducto, cancellationToken)
            ?? throw new BusinessException("Producto no encontrado.");

        producto.CodigoProducto = dto.CodigoProducto.Trim();
        producto.Nombre = dto.Nombre.Trim();
        producto.Marca = dto.Marca.Trim();
        producto.Precio = dto.Precio;
        producto.Stock = dto.Stock;
        producto.Activo = dto.Activo;

        var actualizado = await _productosRepository.ActualizarAsync(producto, cancellationToken);
        return MapToResponse(actualizado);
    }

    private static ProductoResponseDto MapToResponse(Producto p)
    {
        return new ProductoResponseDto
        {
            IdProducto = p.IdProducto,
            CodigoProducto = p.CodigoProducto,
            Nombre = p.Nombre,
            Marca = p.Marca,
            Precio = p.Precio,
            Stock = p.Stock,
            Activo = p.Activo
        };
    }
}
