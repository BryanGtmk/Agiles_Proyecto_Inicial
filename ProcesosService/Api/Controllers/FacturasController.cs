using Microsoft.AspNetCore.Mvc;
using ProcesosService.Application.DTOs;
using ProcesosService.Application.Interfaces;

namespace ProcesosService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FacturasController : ControllerBase
{
    private readonly IFacturasService _facturasService;

    public FacturasController(IFacturasService facturasService)
    {
        _facturasService = facturasService;
    }

    [HttpPost]
    public async Task<IActionResult> Emitir([FromBody] FacturaCreateDto request, CancellationToken cancellationToken)
    {
        var factura = await _facturasService.EmitirFacturaAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = factura.IdCompra }, factura);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var factura = await _facturasService.ObtenerPorIdAsync(id, cancellationToken);
        return factura is null ? NotFound(new { message = "Factura no encontrada." }) : Ok(factura);
    }

    [HttpPost("pdf")]
    [Produces("application/pdf")]
    public async Task<IActionResult> GenerarPdf([FromBody] FacturaPdfRequestDto request, CancellationToken cancellationToken)
    {
        var pdfBytes = await _facturasService.GenerarPdfAsync(request, cancellationToken);
        var fileName = BuildFileName(request.NumeroComprobante);
        return File(pdfBytes, "application/pdf", fileName);
    }

    [HttpGet("{id:int}/pdf")]
    [Produces("application/pdf")]
    public async Task<IActionResult> GetPdfById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var pdfBytes = await _facturasService.GenerarPdfPorIdAsync(id, cancellationToken);
        if (pdfBytes is null)
        {
            return NotFound(new { message = "Factura no encontrada." });
        }

        var fileName = $"factura-{id}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }

    private static string BuildFileName(string numeroComprobante)
    {
        var sanitized = string.IsNullOrWhiteSpace(numeroComprobante)
            ? "factura"
            : new string(numeroComprobante.Where(ch => char.IsLetterOrDigit(ch) || ch is '-' or '_').ToArray());

        if (string.IsNullOrWhiteSpace(sanitized))
        {
            sanitized = "factura";
        }

        return $"{sanitized}.pdf";
    }
}
