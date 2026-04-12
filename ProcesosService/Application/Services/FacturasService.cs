using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ProcesosService.Application.Documents;
using ProcesosService.Application.DTOs;
using ProcesosService.Application.Interfaces;
using ProcesosService.Application.Settings;
using ProcesosService.Domain.Entities;
using ProcesosService.Infrastructure.Persistence;
using QuestPDF.Fluent;

namespace ProcesosService.Application.Services;

public class FacturasService : IFacturasService
{
    private const decimal IvaRate = 0.15m;

    private readonly ProcesoDbContext _dbContext;
    private readonly IProductosRepository _productosRepository;
    private readonly IFacturasRepository _facturasRepository;
    private readonly FacturaPdfOptions _pdfOptions;

    public FacturasService(
        ProcesoDbContext dbContext,
        IProductosRepository productosRepository,
        IFacturasRepository facturasRepository,
        IOptions<FacturaPdfOptions> pdfOptions)
    {
        _dbContext = dbContext;
        _productosRepository = productosRepository;
        _facturasRepository = facturasRepository;
        _pdfOptions = pdfOptions.Value;
    }

    public async Task<FacturaResponseDto> EmitirFacturaAsync(FacturaCreateDto request, CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La factura debe contener al menos un producto.");
        }

        if (request.Detalles.Any(detalle => detalle.Cantidad <= 0))
        {
            throw new BusinessException("Todas las lineas de la factura deben tener una cantidad mayor a cero.");
        }

        if (request.Descuento < 0)
        {
            throw new BusinessException("El descuento no puede ser negativo.");
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var idsProductos = request.Detalles.Select(d => d.IdProducto).Distinct().ToList();
        var productos = await _productosRepository.ObtenerPorIdsAsync(idsProductos, cancellationToken);
        if (productos.Count != idsProductos.Count)
        {
            throw new BusinessException("Uno o mas productos no existen.");
        }

        foreach (var detalle in request.Detalles)
        {
            if (!productos.Any(producto => producto.IdProducto == detalle.IdProducto))
            {
                throw new BusinessException("Uno o mas productos no existen.");
            }
        }

        var detalles = new List<CompraDetalle>();
        decimal subtotal = 0;
        var descuento = Math.Round(Math.Max(request.Descuento, 0m), 2);

        foreach (var detalleRequest in request.Detalles)
        {
            var producto = productos.First(p => p.IdProducto == detalleRequest.IdProducto);

            if (!producto.Activo)
            {
                throw new BusinessException($"El producto {producto.Nombre} esta inactivo.");
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

    public Task<byte[]> GenerarPdfAsync(FacturaPdfRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request.Detalles.Count == 0)
        {
            throw new BusinessException("La factura debe contener al menos un detalle para generar el PDF.");
        }

        var normalizedRequest = NormalizePdfRequest(request);
        var document = new FacturaPdfDocument(normalizedRequest);
        var bytes = document.GeneratePdf();
        return Task.FromResult(bytes);
    }

    public async Task<byte[]?> GenerarPdfPorIdAsync(int idCompra, CancellationToken cancellationToken = default)
    {
        var compra = await _facturasRepository.ObtenerPorIdAsync(idCompra, cancellationToken);
        if (compra is null)
        {
            return null;
        }

        var request = new FacturaPdfRequestDto
        {
            NombreNegocio = _pdfOptions.NombreNegocio,
            RucNegocio = _pdfOptions.RucNegocio,
            DireccionNegocio = _pdfOptions.DireccionNegocio,
            TelefonoNegocio = _pdfOptions.TelefonoNegocio,
            NumeroComprobante = compra.NumeroComprobante,
            FechaEmision = compra.FechaCompra,
            NombreClienteFactura = compra.NombreClienteFactura,
            TipoIdentificacionComprador = compra.TipoIdentificacionComprador,
            IdentificacionComprador = compra.IdentificacionComprador,
            Subtotal = compra.Subtotal,
            Descuento = compra.Descuento,
            IVA = compra.IVA,
            Total = compra.Total,
            Estado = compra.Estado,
            Detalles = compra.Detalles.Select(detalle => new FacturaPdfDetalleDto
            {
                CodigoProducto = detalle.CodigoProducto,
                DescripcionProducto = detalle.DescripcionProducto,
                MarcaProducto = string.Empty,
                Cantidad = detalle.Cantidad,
                PrecioUnitario = detalle.PrecioUnitario,
                SubtotalLinea = detalle.SubtotalLinea
            }).ToList()
        };

        return await GenerarPdfAsync(request, cancellationToken);
    }

    private static string GenerarNumeroComprobante()
    {
        return $"FAC-{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Random.Shared.Next(100, 999)}";
    }

    private static FacturaPdfRequestDto NormalizePdfRequest(FacturaPdfRequestDto request)
    {
        return new FacturaPdfRequestDto
        {
            NombreNegocio = request.NombreNegocio.Trim(),
            RucNegocio = request.RucNegocio.Trim(),
            DireccionNegocio = request.DireccionNegocio.Trim(),
            TelefonoNegocio = request.TelefonoNegocio.Trim(),
            NumeroComprobante = request.NumeroComprobante.Trim(),
            FechaEmision = request.FechaEmision == default ? DateTime.UtcNow : request.FechaEmision,
            NombreClienteFactura = request.NombreClienteFactura.Trim(),
            TipoIdentificacionComprador = request.TipoIdentificacionComprador.Trim(),
            IdentificacionComprador = request.IdentificacionComprador.Trim(),
            Subtotal = Math.Round(request.Subtotal, 2),
            Descuento = Math.Round(request.Descuento, 2),
            IVA = Math.Round(request.IVA, 2),
            Total = Math.Round(request.Total, 2),
            Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Emitida" : request.Estado.Trim(),
            Detalles = request.Detalles.Select(detalle => new FacturaPdfDetalleDto
            {
                CodigoProducto = detalle.CodigoProducto.Trim(),
                DescripcionProducto = detalle.DescripcionProducto.Trim(),
                MarcaProducto = string.IsNullOrWhiteSpace(detalle.MarcaProducto) ? string.Empty : detalle.MarcaProducto.Trim(),
                Cantidad = detalle.Cantidad,
                PrecioUnitario = Math.Round(detalle.PrecioUnitario, 2),
                SubtotalLinea = Math.Round(detalle.SubtotalLinea, 2)
            }).ToList()
        };
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
