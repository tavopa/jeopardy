#!/bin/bash

# Jeopardy Trivia - Tech Edition
# Script de inicio para desarrollo y producción

echo "🎯 Iniciando Jeopardy Trivia - Tech Edition"
echo "=========================================="

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear directorio de datos si no existe
mkdir -p backend_data

echo "🔧 Construyendo contenedores..."
docker-compose build

echo "🚀 Iniciando servicios..."
docker-compose up -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 10

# Verificar que los servicios estén funcionando
echo "🔍 Verificando servicios..."

# Verificar backend
if curl -f http://localhost:8000/ &> /dev/null; then
    echo "✅ Backend funcionando en http://localhost:8000"
else
    echo "❌ Backend no está respondiendo"
fi

# Verificar frontend
if curl -f http://localhost:3000/ &> /dev/null; then
    echo "✅ Frontend funcionando en http://localhost:3000"
else
    echo "❌ Frontend no está respondiendo"
fi

echo ""
echo "🎉 ¡Jeopardy Trivia está listo!"
echo "================================"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 Documentación API: http://localhost:8000/docs"
echo ""
echo "Para detener los servicios, ejecuta:"
echo "docker-compose down"
echo ""
echo "Para ver los logs, ejecuta:"
echo "docker-compose logs -f"
