# Sistema Web de Facturación para Ferretería

## Descripción del sistema

Sistema web de facturación con arquitectura de microservicios para gestionar:

- Clientes (naturales, jurídicos y consumidor final)
- Productos y stock
- Emisión de facturas con cálculo de totales en backend

El sistema separa responsabilidades por servicio y usa dos bases de datos diferentes.

## Tecnologías usadas

- Backend: ASP.NET Core Web API (.NET 9, C#)
- Persistencia: Entity Framework Core
- Base de datos: SQL Server
- Frontend: React + Vite (JavaScript)
- Documentación de APIs: Swagger

## Arquitectura general

- ClienteService
  - Base de datos: FerreteriaClientesDB
  - Funciones: alta, búsqueda y actualización de clientes

- ProcesoService
  - Base de datos: FerreteriaProcesosDB
  - Funciones: productos, facturación, detalle y actualización de stock

- frontend-react
  - En este repositorio está implementado en la carpeta `frontend`
  - Funciones: flujo de nueva factura y consumo de APIs

Regla clave: no existe foreign key física entre bases distintas; `IdCliente` en facturas es una referencia lógica.

## Instrucciones para ejecutar ClienteService

1. Restaurar y compilar:

```bash
dotnet build ClientesService/ClientesService.csproj
```

2. Ejecutar migraciones (si aplica):

```bash
dotnet ef database update --project ClientesService/ClientesService.csproj --startup-project ClientesService/ClientesService.csproj
```

3. Levantar servicio:

```bash
dotnet run --project ClientesService/ClientesService.csproj
```

4. Swagger:

- http://localhost:5001/swagger

## Instrucciones para ejecutar ProcesoService

1. Restaurar y compilar:

```bash
dotnet build ProcesosService/ProcesosService.csproj
```

2. Ejecutar migraciones (si aplica):

```bash
dotnet ef database update --project ProcesosService/ProcesosService.csproj --startup-project ProcesosService/ProcesosService.csproj
```

3. Levantar servicio:

```bash
dotnet run --project ProcesosService/ProcesosService.csproj
```

4. Swagger:

- http://localhost:5002/swagger

## Instrucciones para ejecutar frontend-react

1. Ir a la carpeta del frontend:

```bash
cd frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear archivo de entorno (si no existe), tomando como base `frontend/.env.example`.

4. Levantar en desarrollo:

```bash
npm run dev
```

5. Build de producción:

```bash
npm run build
```

## Explicación breve del flujo de facturación

1. El usuario abre Nueva Factura y elige tipo de facturación.
2. Si selecciona consumidor final, se usa automáticamente el cliente genérico del sistema.
3. Si selecciona con datos del cliente, busca por tipo y número de identificación; si no existe, registra el cliente.
4. Selecciona productos y arma el detalle.
5. El backend valida stock y calcula `subtotal`, `descuento`, `IVA` y `total`.
6. Se emite la factura en una transacción: guarda cabecera, guarda detalle y descuenta stock.
