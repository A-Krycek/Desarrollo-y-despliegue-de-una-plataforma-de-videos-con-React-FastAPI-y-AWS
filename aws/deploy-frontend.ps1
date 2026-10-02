
param(
    [string]$BucketFrontend = "video-platform-frontend-kry",
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

Write-Host "=== 1. Compilando aplicación React con Vite ===" -ForegroundColor Cyan
$frontendDir = Join-Path $PSScriptRoot "..\frontend"
Push-Location $frontendDir

try {
    npm run build
} finally {
    Pop-Location
}

$distDir = Join-Path $frontendDir "dist"
if (-not (Test-Path $distDir)) {
    Write-Error "El directorio dist/ no fue encontrado."
    exit 1
}

Write-Host "=== 2. Sincronizando dist/ con s3://$BucketFrontend ===" -ForegroundColor Cyan

aws s3 sync $distDir "s3://$BucketFrontend" --delete --region $Region

Write-Host "=== ¡Despliegue del Frontend exitoso! ===" -ForegroundColor Green
Write-Host "URL SPA: http://$BucketFrontend.s3-website-$Region.amazonaws.com" -ForegroundColor Yellow
