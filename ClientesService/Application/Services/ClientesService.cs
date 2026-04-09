using ClientesService.Application.DTOs;
using ClientesService.Application.Interfaces;
using ClientesService.Domain.Entities;
using ClientesService.Domain.Enums;

namespace ClientesService.Application.Services;

public class ClientesService : IClientesService
{
    private readonly IClientesRepository _clientesRepository;

    public ClientesService(IClientesRepository clientesRepository)
    {
        _clientesRepository = clientesRepository;
    }

    public async Task<ClienteResponseDto?> BuscarPorIdentificacionAsync(TipoIdentificacionFiscal tipoIdentificacion, string numero, CancellationToken cancellationToken = default)
    {
        var cliente = await _clientesRepository.BuscarPorIdentificacionAsync(tipoIdentificacion, numero, cancellationToken);
        return cliente is null ? null : MapToResponse(cliente);
    }

    public async Task<ClienteResponseDto?> ObtenerPorIdAsync(int idCliente, CancellationToken cancellationToken = default)
    {
        var cliente = await _clientesRepository.ObtenerPorIdAsync(idCliente, cancellationToken);
        return cliente is null ? null : MapToResponse(cliente);
    }

    public async Task<ClienteResponseDto> CrearNaturalAsync(CrearClienteNaturalDto dto, CancellationToken cancellationToken = default)
    {
        // Validaciones de negocio para consistencia del catálogo de clientes.
        ValidarTipoPersona(dto.TipoPersona, TipoPersona.Natural);
        ValidarTipoIdentificacionNatural(dto.TipoIdentificacionFiscal);
        ValidarTextoObligatorio(dto.NumeroIdentificacion, "Número de identificación");
        ValidarTextoObligatorio(dto.Nombres, "Nombres");
        ValidarTextoObligatorio(dto.Apellidos, "Apellidos");
        await ValidarIdentificacionDuplicada(dto.TipoIdentificacionFiscal, dto.NumeroIdentificacion, cancellationToken);

        var cliente = new Cliente
        {
            TipoPersona = TipoPersona.Natural,
            TipoIdentificacionFiscal = dto.TipoIdentificacionFiscal,
            NumeroIdentificacion = dto.NumeroIdentificacion.Trim(),
            Correo = dto.Correo?.Trim(),
            Telefono = dto.Telefono?.Trim(),
            Direccion = dto.Direccion?.Trim(),
            FechaRegistro = DateTime.UtcNow,
            Estado = true,
            ClienteNatural = new ClienteNatural
            {
                Nombres = dto.Nombres.Trim(),
                Apellidos = dto.Apellidos.Trim()
            }
        };

        var creado = await _clientesRepository.CrearAsync(cliente, cancellationToken);
        return MapToResponse(creado);
    }

    public async Task<ClienteResponseDto> CrearJuridicoAsync(CrearClienteJuridicoDto dto, CancellationToken cancellationToken = default)
    {
        // Validaciones de negocio para cliente jurídico.
        ValidarTipoPersona(dto.TipoPersona, TipoPersona.Juridica);
        ValidarTipoIdentificacionJuridica(dto.TipoIdentificacionFiscal);
        ValidarTextoObligatorio(dto.NumeroIdentificacion, "Número de identificación");
        ValidarTextoObligatorio(dto.RazonSocial, "Razón social");
        await ValidarIdentificacionDuplicada(dto.TipoIdentificacionFiscal, dto.NumeroIdentificacion, cancellationToken);

        var cliente = new Cliente
        {
            TipoPersona = TipoPersona.Juridica,
            TipoIdentificacionFiscal = dto.TipoIdentificacionFiscal,
            NumeroIdentificacion = dto.NumeroIdentificacion.Trim(),
            Correo = dto.Correo?.Trim(),
            Telefono = dto.Telefono?.Trim(),
            Direccion = dto.Direccion?.Trim(),
            FechaRegistro = DateTime.UtcNow,
            Estado = true,
            ClienteJuridico = new ClienteJuridico
            {
                RazonSocial = dto.RazonSocial.Trim()
            }
        };

        var creado = await _clientesRepository.CrearAsync(cliente, cancellationToken);
        return MapToResponse(creado);
    }

    public async Task<ClienteResponseDto> ActualizarAsync(int idCliente, ActualizarClienteDto dto, CancellationToken cancellationToken = default)
    {
        var cliente = await _clientesRepository.ObtenerPorIdAsync(idCliente, cancellationToken)
            ?? throw new BusinessException("El cliente no existe.");

        cliente.Correo = dto.Correo?.Trim();
        cliente.Telefono = dto.Telefono?.Trim();
        cliente.Direccion = dto.Direccion?.Trim();
        cliente.Estado = dto.Estado;

        var actualizado = await _clientesRepository.ActualizarAsync(cliente, cancellationToken);
        return MapToResponse(actualizado);
    }

    private async Task ValidarIdentificacionDuplicada(TipoIdentificacionFiscal tipoIdentificacion, string numeroIdentificacion, CancellationToken cancellationToken)
    {
        // Regla de unicidad lógica: no repetir tipo+identificación.
        var existe = await _clientesRepository.ExisteIdentificacionAsync(tipoIdentificacion, numeroIdentificacion.Trim(), cancellationToken);
        if (existe)
        {
            throw new BusinessException("Ya existe un cliente con el tipo y número de identificación ingresado.");
        }
    }

    private static void ValidarTipoPersona(TipoPersona valorRecibido, TipoPersona esperado)
    {
        if (valorRecibido != esperado)
        {
            throw new BusinessException($"El tipo de persona debe ser {esperado}.");
        }
    }

    private static void ValidarTextoObligatorio(string? valor, string nombreCampo)
    {
        if (string.IsNullOrWhiteSpace(valor))
        {
            throw new BusinessException($"{nombreCampo} es obligatorio.");
        }
    }

    private static void ValidarTipoIdentificacionNatural(TipoIdentificacionFiscal tipoIdentificacion)
    {
        if (tipoIdentificacion is TipoIdentificacionFiscal.Cedula or TipoIdentificacionFiscal.Ruc or TipoIdentificacionFiscal.Pasaporte or TipoIdentificacionFiscal.IdentificacionExterior)
        {
            return;
        }

        throw new BusinessException("Para persona natural solo se permite Cédula, RUC, Pasaporte o Identificación del exterior.");
    }

    private static void ValidarTipoIdentificacionJuridica(TipoIdentificacionFiscal tipoIdentificacion)
    {
        if (tipoIdentificacion is TipoIdentificacionFiscal.Ruc or TipoIdentificacionFiscal.IdentificacionExterior)
        {
            return;
        }

        throw new BusinessException("Para persona jurídica solo se permite RUC o Identificación del exterior.");
    }

    private static ClienteResponseDto MapToResponse(Cliente cliente)
    {
        return new ClienteResponseDto
        {
            IdCliente = cliente.IdCliente,
            TipoPersona = cliente.TipoPersona,
            TipoIdentificacionFiscal = cliente.TipoIdentificacionFiscal,
            NumeroIdentificacion = cliente.NumeroIdentificacion,
            Correo = cliente.Correo,
            Telefono = cliente.Telefono,
            Direccion = cliente.Direccion,
            FechaRegistro = cliente.FechaRegistro,
            Estado = cliente.Estado,
            NombreClienteFactura = cliente.TipoPersona == TipoPersona.Natural
                ? $"{cliente.ClienteNatural?.Nombres} {cliente.ClienteNatural?.Apellidos}".Trim()
                : cliente.ClienteJuridico?.RazonSocial ?? string.Empty
        };
    }
}
