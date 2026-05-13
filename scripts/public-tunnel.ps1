param(
  [string]$Url = "http://127.0.0.1:3000",
  [int]$MaxRetries = 3,
  [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[Console]::InputEncoding = $utf8NoBom
[Console]::OutputEncoding = $utf8NoBom
$OutputEncoding = $utf8NoBom

if ($env:OS -eq "Windows_NT") {
  & chcp.com 65001 > $null 2>&1
}

function ConvertFrom-CodePointHex {
  param([string[]]$Hex)

  -join ($Hex | ForEach-Object { [char][Convert]::ToInt32($_, 16) })
}

$publicUrlLabel = ConvertFrom-CodePointHex @(
  "516C",
  "7F51",
  "8BBF",
  "95EE",
  "5730",
  "5740",
  "FF1A"
)
$shareUrlMessage = "$(ConvertFrom-CodePointHex @("628A", "4E0A", "9762", "8FD9", "4E2A")) https $(ConvertFrom-CodePointHex @("5730", "5740", "53D1", "7ED9", "522B", "4EBA", "5373", "53EF", "8BBF", "95EE", "3002"))"

function Resolve-Cloudflared {
  $command = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $candidates = @(
    "C:\Program Files (x86)\cloudflared\cloudflared.exe",
    "C:\Program Files\cloudflared\cloudflared.exe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links\cloudflared.exe"
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  throw "cloudflared.exe was not found. Install it with: winget install --id Cloudflare.cloudflared"
}

function Test-LocalTarget {
  param([string]$TargetUrl)

  try {
    $response = Invoke-WebRequest -Uri $TargetUrl -UseBasicParsing -TimeoutSec 8
    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 500) {
      throw "Unexpected HTTP status $($response.StatusCode)"
    }
  } catch {
    throw "Local service is not reachable at $TargetUrl. Start it first with: npm run start:public"
  }
}

$cloudflared = Resolve-Cloudflared

Write-Host "[public-tunnel] cloudflared: $cloudflared"
& $cloudflared --version

Write-Host "[public-tunnel] checking local service: $Url"
Test-LocalTarget -TargetUrl $Url

if ($CheckOnly) {
  Write-Host "[public-tunnel] check passed."
  exit 0
}

Write-Host "[public-tunnel] starting Cloudflare Quick Tunnel..."
Write-Host "[public-tunnel] keep this terminal open after the https://*.trycloudflare.com URL appears."
Write-Host "[public-tunnel] use only the newest URL printed by this run; old Quick Tunnel URLs expire."
Write-Host ""

$tunnelArgs = @(
  "tunnel",
  "--no-autoupdate",
  "--edge-ip-version", "4",
  "--protocol", "http2",
  "--url", $Url
)

for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
  if ($attempt -gt 1) {
    Write-Host ""
    Write-Host "[public-tunnel] retrying Cloudflare handshake ($attempt/$MaxRetries)..."
    Start-Sleep -Seconds 3
  }

  $previousErrorActionPreference = $ErrorActionPreference
  $previousNativePreference = $null
  if (Test-Path variable:PSNativeCommandUseErrorActionPreference) {
    $previousNativePreference = $PSNativeCommandUseErrorActionPreference
    $PSNativeCommandUseErrorActionPreference = $false
  }

  try {
    $ErrorActionPreference = "Continue"
    & $cloudflared @tunnelArgs 2>&1 | ForEach-Object {
      $line = $_.ToString()
      Write-Host $line

      $match = [regex]::Match($line, "https://(?!api\.)[a-zA-Z0-9-]+\.trycloudflare\.com")
      if ($match.Success) {
        Write-Host ""
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host $publicUrlLabel -ForegroundColor Green
        Write-Host $match.Value -ForegroundColor Cyan
        Write-Host $shareUrlMessage -ForegroundColor Green
        Write-Host "============================================================" -ForegroundColor Green
        Write-Host ""
      }
    }
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
    if ($null -ne $previousNativePreference) {
      $PSNativeCommandUseErrorActionPreference = $previousNativePreference
    }
  }
  $exitCode = $LASTEXITCODE

  if ($exitCode -eq 0) {
    exit 0
  }

  if ($attempt -eq $MaxRetries) {
    Write-Host ""
    Write-Host "[public-tunnel] cloudflared exited with code $exitCode after $MaxRetries attempts."
    exit $exitCode
  }
}
