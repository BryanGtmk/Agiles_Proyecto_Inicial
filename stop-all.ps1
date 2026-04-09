$ErrorActionPreference = "Continue"

Write-Host "Deteniendo contenedor SQL Server..."
docker compose down

Write-Host "Deteniendo procesos locales por puerto..."
$ports = @(5001, 5002, 5173)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        if ($connection.OwningProcess -gt 0) {
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "Proceso detenido en puerto $port (PID $($connection.OwningProcess))."
        }
    }
}

Write-Host "Listo."
