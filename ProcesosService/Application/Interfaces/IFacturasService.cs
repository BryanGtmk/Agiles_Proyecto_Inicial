using ProcesosService.Application.DTOs;

namespace ProcesosService.Application.Interfaces;

public interface IFacturasService
{
    Task<FacturaResponseDto> EmitirFacturaAsync(FacturaCreateDto request, CancellationToken cancellationToken = default);
    Task<FacturaResponseDto?> ObtenerPorIdAsync(int idCompra, CancellationToken cancellationToken = default);
    Task<byte[]> GenerarPdfAsync(FacturaPdfRequestDto request, CancellationToken cancellationToken = default);
    Task<byte[]?> GenerarPdfPorIdAsync(int idCompra, CancellationToken cancellationToken = default);
}
