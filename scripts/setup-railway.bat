@echo off
chcp 65001 >nul
echo ════════════════════════════════════════════
echo   SETUP RAILWAY — Portal Imobiliario
echo ════════════════════════════════════════════
echo.

REM Verificar se railway CLI está instalado
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Railway CLI não encontrado. A instalar...
    npm install -g @railway/cli
    if %errorlevel% neq 0 (
        echo ❌ Falha ao instalar Railway CLI.
        echo    Corre manualmente: npm install -g @railway/cli
        pause
        exit /b 1
    )
    echo ✅ Railway CLI instalado.
) else (
    echo ✅ Railway CLI encontrado.
)

echo.
echo 🔐 Faz login no Railway (vai abrir o browser)...
railway login
if %errorlevel% neq 0 (
    echo ❌ Login falhou.
    pause
    exit /b 1
)

echo.
echo 📁 Liga o projeto local ao Railway...
railway link
if %errorlevel% neq 0 (
    echo ❌ Falha ao ligar projeto. Cria um projeto no dashboard primeiro.
    pause
    exit /b 1
)

echo.
echo 🗄️  Adicionar PostgreSQL...
railway add --database postgres
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL pode já existir ou falhou. Continuando...
)

echo.
echo 🚀 Criar serviço API...
railway up --service portal-api
if %errorlevel% neq 0 (
    echo ⚠️  Serviço API pode já existir. Continuando...
)

echo.
echo 🌐 Criar serviço Web...
railway up --service portal-web
if %errorlevel% neq 0 (
    echo ⚠️  Serviço Web pode já existir. Continuando...
)

echo.
echo ════════════════════════════════════════════
echo   ✅ Setup completo!
echo ════════════════════════════════════════════
echo.
echo Próximos passos:
echo 1. Vai ao dashboard do Railway e gera domínios para os serviços
echo 2. Configura as variáveis de ambiente (FRONTEND_URL, NEXT_PUBLIC_API_URL)
echo 3. Correr migrações: railway run --service portal-api npx prisma migrate deploy
echo 4. Fazer seed: railway run --service portal-api npx tsx apps/api/src/lib/seed-db.ts
echo.
echo Depois disto, cada push para main faz deploy automático!
echo.
pause
