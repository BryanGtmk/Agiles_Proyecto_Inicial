using ClientesService.Application.DTOs;
using ClientesService.Application.Interfaces;
using ClientesService.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ClientesService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly IClientesService _clientesService;

    public ClientesController(IClientesService clientesService)
    {
        _clientesService = clientesService;
    }

    [HttpGet("buscar")]
    public async Task<IActionResult> Buscar([FromQuery] TipoIdentificacionFiscal tipoIdentificacion, [FromQuery] string numero, CancellationToken cancellationToken)
    {
        var cliente = await _clientesService.BuscarPorIdentificacionAsync(tipoIdentificacion, numero, cancellationToken);
        return cliente is null ? NotFound(new { message = "Cliente no encontrado." }) : Ok(cliente);
    }

    [HttpPost("natural")]
    public async Task<IActionResult> CrearNatural([FromBody] CrearClienteNaturalDto dto, CancellationToken cancellationToken)
    {
        var creado = await _clientesService.CrearNaturalAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.IdCliente }, creado);
    }

    [HttpPost("juridico")]
    public async Task<IActionResult> CrearJuridico([FromBody] CrearClienteJuridicoDto dto, CancellationToken cancellationToken)
    {
        var creado = await _clientesService.CrearJuridicoAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.IdCliente }, creado);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObtenerPorId([FromRoute] int id, CancellationToken cancellationToken)
    {
        var cliente = await _clientesService.ObtenerPorIdAsync(id, cancellationToken);
        return cliente is null ? NotFound(new { message = "Cliente no encontrado." }) : Ok(cliente);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar([FromRoute] int id, [FromBody] ActualizarClienteDto dto, CancellationToken cancellationToken)
    {
        var actualizado = await _clientesService.ActualizarAsync(id, dto, cancellationToken);
        return Ok(actualizado);
    }
}
