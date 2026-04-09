using Microsoft.EntityFrameworkCore;
using ProcesosService.Application.Interfaces;
using ProcesosService.Domain.Entities;
using ProcesosService.Infrastructure.Persistence;

namespace ProcesosService.Infrastructure.Repositories;

public class FacturasRepository : IFacturasRepository
{
    private readonly ProcesoDbContext _dbContext;

    public FacturasRepository(ProcesoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<CompraCabecera> CrearAsync(CompraCabecera compra, CancellationToken cancellationToken = default)
    {
        _dbContext.ComprasCabecera.Add(compra);
        return Task.FromResult(compra);
    }

    public async Task<CompraCabecera?> ObtenerPorIdAsync(int idCompra, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ComprasCabecera
            .Include(c => c.Detalles)
            .FirstOrDefaultAsync(c => c.IdCompra == idCompra, cancellationToken);
    }
}
