
# TSA SmartWorkforce AI - Script de Deploiement Hostinger
# Genere hostinger-deploy.zip pret pour upload dans public_html

$sourceDir = $PSScriptRoot
$zipPath = "$sourceDir\hostinger-deploy.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "Ancien ZIP supprime." -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  TSA SmartWorkforce - Build Hostinger      " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$tempDir = "$env:TEMP\hostinger_build_$([Guid]::NewGuid().ToString())"
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    # Elements a inclure dans le ZIP
    $items = @(
        ".htaccess",
        "index.php",
        "index.html",
        "backend",
        "frontend",
        "api"
    )

    foreach ($item in $items) {
        $srcPath = "$sourceDir\$item"
        if (Test-Path $srcPath) {
            $destPath = "$tempDir\$item"
            Copy-Item -Path $srcPath -Destination $destPath -Recurse -Force
            Write-Host "  OK Copie : $item" -ForegroundColor Green
        } else {
            Write-Host "  ABSENT (ignore) : $item" -ForegroundColor Yellow
        }
    }

    # Supprimer node_modules (trop lourd pour le deploiement)
    $tempNodeModules = "$tempDir\backend\node_modules"
    if (Test-Path $tempNodeModules) {
        Remove-Item -Path $tempNodeModules -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  node_modules exclus du ZIP" -ForegroundColor Gray
    }

    # Supprimer .env du ZIP (donnees sensibles)
    $tempEnv = "$tempDir\backend\.env"
    if (Test-Path $tempEnv) {
        Remove-Item -Path $tempEnv -Force -ErrorAction SilentlyContinue
        Write-Host "  .env exclu du ZIP (securite)" -ForegroundColor Gray
    }

    # Compresser
    Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

    $zipSize = [math]::Round((Get-Item $zipPath).Length / 1024)
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  ZIP genere avec succes !" -ForegroundColor Green
    Write-Host "  Taille : $zipSize Ko" -ForegroundColor Green
    Write-Host "  Fichier : hostinger-deploy.zip" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "ETAPES HOSTINGER :" -ForegroundColor Yellow
    Write-Host "  1. Connectez-vous a hPanel Hostinger" -ForegroundColor White
    Write-Host "  2. Allez dans Gestionnaire de fichiers - public_html" -ForegroundColor White
    Write-Host "  3. Uploadez hostinger-deploy.zip" -ForegroundColor White
    Write-Host "  4. Clic droit - Extraire ici" -ForegroundColor White
    Write-Host "  5. Configurez backend/.env avec vos identifiants MySQL" -ForegroundColor White
    Write-Host ""

} catch {
    $errMsg = $_.Exception.Message
    Write-Host "ERREUR : $errMsg" -ForegroundColor Red
} finally {
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
