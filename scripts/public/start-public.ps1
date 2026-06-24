param(
  [int]$Port = 3000,
  [string]$HostName = "0.0.0.0"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $ProjectRoot

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[Console]::InputEncoding = $utf8NoBom
[Console]::OutputEncoding = $utf8NoBom
$OutputEncoding = $utf8NoBom

if ($env:OS -eq "Windows_NT") {
  & chcp.com 65001 > $null 2>&1
}

function Get-ListeningProcess {
  param([int]$TargetPort)

  $connection = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

  if (-not $connection) {
    return $null
  }

  Get-CimInstance Win32_Process -Filter "ProcessId = $($connection.OwningProcess)" |
    Select-Object -First 1
}

$process = Get-ListeningProcess -TargetPort $Port

if ($process) {
  if ($process.CommandLine -match "next.*start" -and $process.CommandLine -match "--port\s+$Port") {
    Write-Host "[start-public] Next.js public server is already running on port $Port."
    Write-Host "[start-public] URL: http://127.0.0.1:$Port"
    Write-Host "[start-public] PID: $($process.ProcessId)"
    exit 0
  }

  Write-Host "[start-public] Port $Port is already used by another process." -ForegroundColor Yellow
  Write-Host "[start-public] PID: $($process.ProcessId)" -ForegroundColor Yellow
  Write-Host "[start-public] Command: $($process.CommandLine)" -ForegroundColor Yellow
  Write-Host "[start-public] Stop that process or choose another port." -ForegroundColor Yellow
  exit 1
}

Write-Host "[start-public] Starting Next.js public server on $HostName`:$Port..."
npx next start --hostname $HostName --port $Port
