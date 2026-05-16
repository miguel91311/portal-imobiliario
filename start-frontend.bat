@echo off
echo ==========================================
echo  PORTAL IMOBILIARIO - Frontend (Web)
echo ==========================================
echo.
echo A iniciar servidor frontend...
echo Porta: 3004
echo Modo:  Desenvolvimento (hot reload)
echo.
cd /d "C:\xampp\htdocs\PORTAL IMOBILIARIO\apps\web"
npm run dev -- -p 3004
