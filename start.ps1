# Jeopardy Trivia - Tech Edition
# Script de inicio para Windows PowerShell

Write-Host "🎯 Iniciando Jeopardy Trivia - Tech Edition" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Verificar si Docker está instalado
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado. Por favor instala Docker Desktop primero." -ForegroundColor Red
    exit 1
}

# Verificar si Docker Compose está instalado
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero." -ForegroundColor Red
    exit 1
}

# Crear directorio de datos si no existe
if (!(Test-Path "backend_data")) {
    New-Item -ItemType Directory -Path "backend_data" | Out-Null
    Write-Host "📁 Directorio de datos creado" -ForegroundColor Yellow
}

Write-Host "🔧 Construyendo contenedores..." -ForegroundColor Yellow
docker-compose build

Write-Host "🚀 Iniciando servicios..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "⏳ Esperando que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar que los servicios estén funcionando
Write-Host "🔍 Verificando servicios..." -ForegroundColor Yellow

# Verificar backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend funcionando en http://localhost:8000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend no está respondiendo" -ForegroundColor Red
}

# Verificar frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend funcionando en http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend no está respondiendo" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 ¡Jeopardy Trivia está listo!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 Documentación API: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para detener los servicios, ejecuta:" -ForegroundColor Yellow
Write-Host "docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "Para ver los logs, ejecuta:" -ForegroundColor Yellow
Write-Host "docker-compose logs -f" -ForegroundColor White
