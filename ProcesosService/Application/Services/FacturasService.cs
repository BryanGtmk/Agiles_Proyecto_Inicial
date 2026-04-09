using Microsoft.EntityFrameworkCore;
using ProcesosService.Application.DTOs;
using ProcesosService.Application.Interfaces;
using ProcesosService.Domain.Entities;
using ProcesosService.Infrastructure.Persistence;

namespace ProcesosService.Application.Services;

public class FacturasService : IFacturasService
{
    private const decimal IvaRate = 0.15m;

    private readonly ProcesoDbContext _dbContext;
    private readonly IProductosRepository _productosRepository;
    private readonly IFacturasRepository _facturasRepository;

    public FacturasService(
        ProcesoDbContext dbContext,
        IProductosRepository productosRepository,
        IFacturasRepository facturasRepository)
    {
        _dbContext = dbContext;
        _productosRepository = productosRepository;
        _facturasRepository = facturasRepository;
    }

    public async Task<FacturaResponseDto> EmitirFacturaAsync(FacturaCreateDto request, CancellationToken cancellationToken = default)
    {
        // 1) Validaciones de entrada mínimas.
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La factura debe contener al menos un producto.");
        }

        if (request.Detalles.Any(detalle => detalle.Cantidad <= 0))
        {
            throw new BusinessException("Todas las líneas de la factura deben tener una cantidad mayor a cero.");
        }

        if (request.Descuento < 0)
        {
            throw new BusinessException("El descuento no puede ser negativo.");
        }

        // 2) Toda la emisión se procesa de forma atómica.
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        // 3) Cargar productos en bloque para validar existencia y stock.
        var idsProductos = request.Detalles.Select(d => d.IdProducto).Distinct().ToList();
        var productos = await _productosRepository.ObtenerPorIdsAsync(idsProductos, cancellationToken);
        if (productos.Count != idsProductos.Count)
        {
            throw new BusinessException("Uno o más productos no existen.");
        }

        foreach (var detalle in request.Detalles)
        {
            if (!productos.Any(producto => producto.IdProducto == detalle.IdProducto))
            {
                throw new BusinessException("Uno o más productos no existen.");
            }
        }

        var detalles = new List<CompraDetalle>();
        decimal subtotal = 0;
        var descuento = Math.Round(Math.Max(request.Descuento, 0m), 2);

        // 4) Validar línea por línea y calcular subtotal de cada producto.
        foreach (var detalleRequest in request.Detalles)
        {
            var producto = productos.First(p => p.IdProducto == detalleRequest.IdProducto);

            if (!producto.Activo)
            {
                throw new BusinessException($"El producto {producto.Nombre} está inactivo.");
            }

            if (producto.Stock < detalleRequest.Cantidad)
            {
                throw new BusinessException($"Stock insuficiente para el producto {producto.Nombre}. Stock disponible: {producto.Stock}.");
            }

            var subtotalLinea = Math.Round(producto.Precio * detalleRequest.Cantidad, 2);
            subtotal += subtotalLinea;

            detalles.Add(new CompraDetalle
            {
                IdProducto = producto.IdProducto,
                CodigoProducto = producto.CodigoProducto,
                DescripcionProducto = producto.Nombre,
                Cantidad = detalleRequest.Cantidad,
                PrecioUnitario = producto.Precio,
                SubtotalLinea = subtotalLinea
            });

            producto.Stock -= detalleRequest.Cantidad;
        }

        if (descuento > subtotal)
        {
            throw new BusinessException("El descuento no puede ser mayor que el subtotal.");
        }

        // 5) Cálculo final de valores monetarios en backend.
        var baseImponible = subtotal - descuento;
        var iva = Math.Round(baseImponible * IvaRate, 2);
        var total = Math.Round(baseImponible + iva, 2);

        var compra = new CompraCabecera
        {
            FechaCompra = DateTime.UtcNow,
            NumeroComprobante = GenerarNumeroComprobante(),
            IdCliente = request.IdCliente,
            TipoIdentificacionComprador = request.TipoIdentificacionComprador.Trim(),
            IdentificacionComprador = request.IdentificacionComprador.Trim(),
            NombreClienteFactura = request.NombreClienteFactura.Trim(),
            Subtotal = Math.Round(subtotal, 2),
            Descuento = descuento,
            IVA = iva,
            Total = total,
            Estado = "Emitida",
            Detalles = detalles
        };

        // 6) Persistir cabecera+detalle+stock y confirmar transacción.
        await _facturasRepository.CrearAsync(compra, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapToResponse(compra);
    }

    public async Task<FacturaResponseDto?> ObtenerPorIdAsync(int idCompra, CancellationToken cancellationToken = default)
    {
        var compra = await _facturasRepository.ObtenerPorIdAsync(idCompra, cancellationToken);
        return compra is null ? null : MapToResponse(compra);
    }

    private static string GenerarNumeroComprobante()
    {
        // Código de comprobante único con timestamp y sufijo aleatorio.
        return $"FAC-{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Random.Shared.Next(100, 999)}";
    }

    private static FacturaResponseDto MapToResponse(CompraCabecera compra)
    {
        return new FacturaResponseDto
        {
            IdCompra = compra.IdCompra,
            FechaCompra = compra.FechaCompra,
            NumeroComprobante = compra.NumeroComprobante,
            IdCliente = compra.IdCliente,
            TipoIdentificacionComprador = compra.TipoIdentificacionComprador,
            IdentificacionComprador = compra.IdentificacionComprador,
            NombreClienteFactura = compra.NombreClienteFactura,
            Subtotal = compra.Subtotal,
            Descuento = compra.Descuento,
            IVA = compra.IVA,
            Total = compra.Total,
            Estado = compra.Estado,
            Detalles = compra.Detalles.Select(d => new FacturaDetalleResponseDto
            {
                IdProducto = d.IdProducto,
                CodigoProducto = d.CodigoProducto,
                DescripcionProducto = d.DescripcionProducto,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                SubtotalLinea = d.SubtotalLinea
            }).ToList()
        };
    }
}
