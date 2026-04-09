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
}
