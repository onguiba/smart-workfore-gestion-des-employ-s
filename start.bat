@echo off
chcp 65001 >nul
title TSA SmartWorkforce AI - Demarrage Direct
cd /d "%~dp0"
echo ========================================================
echo   TSA SmartWorkforce AI - Application Prete (Dossier Unique)
echo   100%% Node.js - Base de Donnees JSON Autonome
echo ========================================================
echo.
node server.js
pause