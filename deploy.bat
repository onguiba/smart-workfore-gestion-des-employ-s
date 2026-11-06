@echo off
REM Script de déploiement pour Windows - Smart Workforce AI
REM Usage: deploy.bat [production|development|stop]

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Smart Workforce AI - Deploy Script
echo   Systeme de Gestion Intelligente
echo ========================================
echo.

REM Vérifier que Docker est installé
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Docker n'est pas installe. Veuillez l'installer depuis https://docker.com
    exit /b 1
)

docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Docker Compose n'est pas installe.
    exit /b 1
)

echo [OK] Docker et Docker Compose sont installes
echo.

REM Commande par défaut
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=help

if "%COMMAND%"=="production" goto deploy_production
if "%COMMAND%"=="prod" goto deploy_production
if "%COMMAND%"=="development" goto deploy_development
if "%COMMAND%"=="dev" goto deploy_development
if "%COMMAND%"=="stop" goto stop_services
if "%COMMAND%"=="backup" goto backup_database
if "%COMMAND%"=="logs" goto show_logs
if "%COMMAND%"=="status" goto check_status
if "%COMMAND%"=="help" goto show_help
goto show_help

:deploy_production
echo [INFO] Demarrage du deploiement en PRODUCTION...
echo.

echo [INFO] Arret des conteneurs existants...
docker-compose down 2>nul

echo [INFO] Construction des images Docker...
docker-compose build

echo [INFO] Demarrage des services...
docker-compose up -d

echo [INFO] Attente que les services soient prets...
timeout /t 10 /nobreak >nul

echo.
docker-compose ps
echo.

echo [SUCCESS] Deploiement en production termine avec succes!
echo.
echo Application accessible sur:
echo   - Frontend: http://localhost
echo   - API: http://localhost/api
echo   - App directe: http://localhost:3000
echo.
echo Commandes utiles:
echo   - Voir les logs: docker-compose logs -f
echo   - Arreter: docker-compose down
echo   - Redemarrer: docker-compose restart
goto end

:deploy_development
echo [INFO] Demarrage du deploiement en DEVELOPPEMENT...
echo.

echo [INFO] Arret des conteneurs existants...
docker-compose -f docker-compose.dev.yml down 2>nul

echo [INFO] Construction des images Docker...
docker-compose -f docker-compose.dev.yml build

echo [INFO] Demarrage des services avec hot-reload...
docker-compose -f docker-compose.dev.yml up -d

echo [INFO] Attente que les services soient prets...
timeout /t 10 /nobreak >nul

echo.
docker-compose -f docker-compose.dev.yml ps
echo.

echo [SUCCESS] Deploiement en developpement termine!
echo.
echo Application accessible sur: http://localhost:3000
echo Hot-reload active - Les modifications seront detectees automatiquement
echo.
echo Commandes utiles:
echo   - Voir les logs: docker-compose -f docker-compose.dev.yml logs -f
echo   - Arreter: docker-compose -f docker-compose.dev.yml down
goto end

:stop_services
echo [INFO] Arret de tous les services...
docker-compose down 2>nul
docker-compose -f docker-compose.dev.yml down 2>nul
echo [SUCCESS] Tous les services ont ete arretes
goto end

:backup_database
echo [INFO] Sauvegarde de la base de donnees...
set BACKUP_FILE=backup_%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
set BACKUP_FILE=%BACKUP_FILE: =0%
docker-compose exec -T mysql mysqldump -u smartworkforce -psmartworkforce2026 smart_workforce > %BACKUP_FILE%
echo [SUCCESS] Base de donnees sauvegardee dans: %BACKUP_FILE%
goto end

:show_logs
echo [INFO] Affichage des logs...
docker-compose logs -f --tail=100
goto end

:check_status
echo [INFO] Statut des services:
echo.
docker-compose ps
echo.
echo [INFO] Utilisation des ressources:
docker stats --no-stream
goto end

:show_help
echo Smart Workforce AI - Script de Deploiement
echo.
echo Usage: deploy.bat [COMMAND]
echo.
echo Commandes disponibles:
echo   production    Deployer en mode production (avec Nginx)
echo   dev           Deployer en mode developpement (avec hot-reload)
echo   stop          Arreter tous les services
echo   backup        Sauvegarder la base de donnees
echo   logs          Afficher les logs
echo   status        Verifier l'etat des services
echo   help          Afficher cette aide
echo.
echo Exemples:
echo   deploy.bat production
echo   deploy.bat dev
echo   deploy.bat stop
goto end

:end
echo.
endlocal
