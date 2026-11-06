@echo off
chcp 65001 >nul
title TSA SmartWorkforce AI - 100% Node.js & Base JSON
cd /d "%~dp0"
echo ========================================================
echo   TSA SmartWorkforce AI - Demarrage de l'application
echo   (100%% Node.js & Base JSON Autonome - Sans MySQL/PHP)
echo ========================================================
echo.
node app.js
pause