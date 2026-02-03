#!/bin/bash

# Script para limpiar procesos que usan el puerto 3000 antes de iniciar el frontend

PORT=3000

echo "🔍 Buscando procesos en el puerto $PORT..."

# Buscar procesos usando el puerto 3000
PIDS=$(lsof -ti :$PORT 2>/dev/null || ss -tulpn | grep :$PORT | grep -oP 'pid=\K[0-9]+' 2>/dev/null || echo "")

if [ -z "$PIDS" ]; then
    echo "✅ El puerto $PORT está libre"
else
    echo "⚠️  Encontrados procesos usando el puerto $PORT:"
    echo "$PIDS" | while read PID; do
        if [ ! -z "$PID" ]; then
            PROCESS_INFO=$(ps -p $PID -o comm=,args= 2>/dev/null || echo "Proceso $PID")
            echo "   - PID $PID: $PROCESS_INFO"
        fi
    done
    
    echo "🧹 Terminando procesos..."
    echo "$PIDS" | while read PID; do
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null && echo "   ✓ Proceso $PID terminado" || echo "   ✗ No se pudo terminar el proceso $PID"
        fi
    done
    
    # Esperar un momento para que los procesos se terminen
    sleep 1
    
    # Verificar que el puerto esté libre
    REMAINING=$(lsof -ti :$PORT 2>/dev/null || echo "")
    if [ -z "$REMAINING" ]; then
        echo "✅ Puerto $PORT liberado correctamente"
    else
        echo "⚠️  Algunos procesos aún podrían estar usando el puerto $PORT"
    fi
fi
