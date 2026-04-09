using Microsoft.AspNetCore.Mvc;
using ProcesosService.Application.DTOs;
using ProcesosService.Application.Interfaces;

namespace ProcesosService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly IProductosService _productosService;

    public ProductosController(IProductosService productosService)
    {
        _productosService = productosService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var productos = await _productosService.ObtenerTodosAsync(cancellationToken);
        return Ok(productos);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CrearProductoDto dto, CancellationToken cancellationToken)
    {
        var creado = await _productosService.CrearAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = creado.IdProducto }, creado);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] ActualizarProductoDto dto, CancellationToken cancellationToken)
    {
        var actualizado = await _productosService.ActualizarAsync(id, dto, cancellationToken);
        return Ok(actualizado);
    }
}
