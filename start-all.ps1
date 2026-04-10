$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

function Stop-ProcessByPort {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        if ($connection.OwningProcess -gt 0) {
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "Proceso detenido en puerto $Port (PID $($connection.OwningProcess))."
        }
    }
}

function Wait-ForSqlPort {
    param(
        [string]$SqlHost = "localhost",
        [int]$Port = 1433,
        [int]$MaxAttempts = 60,
        [int]$DelaySeconds = 2
    )

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            $client = New-Object System.Net.Sockets.TcpClient
            $async = $client.BeginConnect($SqlHost, $Port, $null, $null)
            $connected = $async.AsyncWaitHandle.WaitOne(1000, $false)
            if ($connected -and $client.Connected) {
                $client.EndConnect($async)
                $client.Close()
                Write-Host "SQL Server listo en ${SqlHost}:$Port."
                return
            }
            $client.Close()
        } catch {
            # Reintento silencioso.
        }

        Write-Host "Esperando SQL Server en ${SqlHost}:$Port... intento $attempt/$MaxAttempts"
        Start-Sleep -Seconds $DelaySeconds
    }

    throw "Timeout esperando SQL Server en ${SqlHost}:$Port"
}

function Invoke-ExternalWithRetry {
    param(
        [scriptblock]$Command,
        [string]$StepName,
        [int]$MaxAttempts = 5,
        [int]$DelaySeconds = 3
    )

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        Write-Host "[$StepName] Intento $attempt/$MaxAttempts..."
        & $Command

        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$StepName] Completado correctamente."
            return
        }

        if ($attempt -lt $MaxAttempts) {
            Write-Host "[$StepName] Fallo transitorio. Reintentando en $DelaySeconds segundos..."
            Start-Sleep -Seconds $DelaySeconds
        }
    }

    throw "[$StepName] Fallo despues de $MaxAttempts intentos."
}

Write-Host "[0/6] Limpiando procesos previos en puertos 5001, 5002 y 5173..."
Stop-ProcessByPort -Port 5001
Stop-ProcessByPort -Port 5002
Stop-ProcessByPort -Port 5173

Write-Host "[1/6] Verificando Docker daemon..."
try {
    docker info | Out-Null
} catch {
    throw "Docker daemon no esta disponible. Abre Docker Desktop y vuelve a ejecutar este script."
}

Write-Host "[2/6] Levantando SQL Server en Docker..."
docker compose up -d --no-recreate

Write-Host "[2.1/6] Esperando a que SQL Server acepte conexiones..."
Wait-ForSqlPort

Write-Host "[3/6] Restaurando herramientas .NET..."
dotnet tool restore

Write-Host "[4/6] Aplicando migraciones de ClientesService..."
Invoke-ExternalWithRetry -StepName "Migraciones ClientesService" -Command {
    dotnet ef database update --project ClientesService/ClientesService.csproj --startup-project ClientesService/ClientesService.csproj
} -MaxAttempts 6 -DelaySeconds 4

Write-Host "[5/6] Aplicando migraciones de ProcesosService..."
Invoke-ExternalWithRetry -StepName "Migraciones ProcesosService" -Command {
    dotnet ef database update --project ProcesosService/ProcesosService.csproj --startup-project ProcesosService/ProcesosService.csproj
} -MaxAttempts 6 -DelaySeconds 4

Write-Host "[6/6] Abriendo servicios y frontend..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$repoRoot'; dotnet run --project ClientesService/ClientesService.csproj"
)

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$repoRoot'; dotnet run --project ProcesosService/ProcesosService.csproj"
)

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$repoRoot\\frontend'; npm run dev"
)

Write-Host "Listo."
Write-Host "Frontend: http://localhost:5173"
Write-Host "Swagger Clientes: http://localhost:5001/swagger"
Write-Host "Swagger Procesos: http://localhost:5002/swagger"
