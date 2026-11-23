@echo off
cd /d "%~dp0"
echo ====================================================
echo INSTALACION Y EMPAQUETADO DE CALCULADORA IMC
echo ====================================================
echo.

echo 1. Instalando dependencias de Node.js (Electron)...
call npm install
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo 2. Empaquetando la aplicacion...
call npm run package
if %ERRORLEVEL% NEQ 0 goto error

echo.
echo ====================================================
echo PROCESO COMPLETADO
echo Ejecutable: dist\CalculadoraIMC-win32-x64\CalculadoraIMC.exe
echo ====================================================
goto end

:error
echo.
echo ====================================================
echo ERROR: fallo la instalacion o el empaquetado.
echo Revisar que Node.js este instalado y que haya conexion.
echo ====================================================

:end
pause
