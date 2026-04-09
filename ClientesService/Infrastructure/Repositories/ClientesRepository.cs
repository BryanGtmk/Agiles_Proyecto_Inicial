using ClientesService.Application.Interfaces;
using ClientesService.Domain.Entities;
using ClientesService.Domain.Enums;
using ClientesService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ClientesService.Infrastructure.Repositories;

public class ClientesRepository : IClientesRepository
{
    private readonly ClienteDbContext _dbContext;

    public ClientesRepository(ClienteDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Cliente?> BuscarPorIdentificacionAsync(TipoIdentificacionFiscal tipoIdentificacion, string numero, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Clientes
            .Include(c => c.ClienteNatural)
            .Include(c => c.ClienteJuridico)
            .FirstOrDefaultAsync(c => c.TipoIdentificacionFiscal == tipoIdentificacion && c.NumeroIdentificacion == numero, cancellationToken);
    }

    public async Task<Cliente?> ObtenerPorIdAsync(int idCliente, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Clientes
            .Include(c => c.ClienteNatural)
            .Include(c => c.ClienteJuridico)
            .FirstOrDefaultAsync(c => c.IdCliente == idCliente, cancellationToken);
    }

    public async Task<Cliente> CrearAsync(Cliente cliente, CancellationToken cancellationToken = default)
    {
        _dbContext.Clientes.Add(cliente);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return cliente;
    }

    public async Task<Cliente> ActualizarAsync(Cliente cliente, CancellationToken cancellationToken = default)
    {
        _dbContext.Clientes.Update(cliente);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return cliente;
    }

    public async Task<bool> ExisteIdentificacionAsync(TipoIdentificacionFiscal tipoIdentificacion, string numero, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Clientes.AnyAsync(c => c.TipoIdentificacionFiscal == tipoIdentificacion && c.NumeroIdentificacion == numero, cancellationToken);
    }
}
