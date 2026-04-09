using ClientesService.Application.DTOs;
using ClientesService.Domain.Enums;

namespace ClientesService.Application.Interfaces;

public interface IClientesService
{
    Task<ClienteResponseDto?> BuscarPorIdentificacionAsync(TipoIdentificacionFiscal tipoIdentificacion, string numero, CancellationToken cancellationToken = default);
    Task<ClienteResponseDto?> ObtenerPorIdAsync(int idCliente, CancellationToken cancellationToken = default);
    Task<ClienteResponseDto> CrearNaturalAsync(CrearClienteNaturalDto dto, CancellationToken cancellationToken = default);
    Task<ClienteResponseDto> CrearJuridicoAsync(CrearClienteJuridicoDto dto, CancellationToken cancellationToken = default);
    Task<ClienteResponseDto> ActualizarAsync(int idCliente, ActualizarClienteDto dto, CancellationToken cancellationToken = default);
}
