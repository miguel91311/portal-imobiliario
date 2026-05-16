@echo off
echo ==========================================
echo  PORTAL IMOBILIARIO - Iniciar Tudo
echo ==========================================
echo.
echo A abrir backend e frontend em janelas separadas...
echo.
echo Backend:  http://localhost:6000
echo Frontend: http://localhost:3004
echo.

start "Backend API" cmd /k "cd /d C:\xampp\htdocs\PORTAL IMOBILIARIO\apps\api && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend Web" cmd /k "cd /d C:\xampp\htdocs\PORTAL IMOBILIARIO\apps\web && npm run dev -- -p 3004"

echo.
echo Ambos os servidores foram iniciados!
echo.
echo Aguarde 10-15 segundos e aceda a:
echo   http://localhost:3004
echo.
pause
