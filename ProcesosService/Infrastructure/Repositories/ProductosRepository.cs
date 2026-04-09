using Microsoft.EntityFrameworkCore;
using ProcesosService.Application.Interfaces;
using ProcesosService.Domain.Entities;
using ProcesosService.Infrastructure.Persistence;

namespace ProcesosService.Infrastructure.Repositories;

public class ProductosRepository : IProductosRepository
{
    private readonly ProcesoDbContext _dbContext;

    public ProductosRepository(ProcesoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Producto>> ObtenerTodosAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Productos.OrderBy(p => p.Nombre).ToListAsync(cancellationToken);
    }

    public async Task<Producto?> ObtenerPorIdAsync(int idProducto, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Productos.FirstOrDefaultAsync(p => p.IdProducto == idProducto, cancellationToken);
    }

    public async Task<List<Producto>> ObtenerPorIdsAsync(IEnumerable<int> idsProductos, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Productos
            .Where(p => idsProductos.Contains(p.IdProducto))
            .ToListAsync(cancellationToken);
    }

    public async Task<Producto> CrearAsync(Producto producto, CancellationToken cancellationToken = default)
    {
        _dbContext.Productos.Add(producto);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return producto;
    }

    public async Task<Producto> ActualizarAsync(Producto producto, CancellationToken cancellationToken = default)
    {
        _dbContext.Productos.Update(producto);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return producto;
    }
}
