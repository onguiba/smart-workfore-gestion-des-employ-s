@echo off
chcp 65001 >nul
title TSA SmartWorkforce AI - Demarrage Serveur
cd /d "%~dp0backend"
echo ========================================================
echo   TSA SmartWorkforce AI - Demarrage de l'application
echo ========================================================
echo.
node server.js
pause