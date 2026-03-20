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

    # Esperar a que el SO libere el puerto (evita EADDRINUSE al arrancar Next)
    for i in 1 2 3 4 5; do
        sleep 1
        REMAINING=$(lsof -ti :$PORT 2>/dev/null || echo "")
        if [ -z "$REMAINING" ]; then
            echo "✅ Puerto $PORT liberado correctamente"
            break
        fi
        echo "   Esperando liberación del puerto... ($i/5)"
    done
    REMAINING=$(lsof -ti :$PORT 2>/dev/null || echo "")
    if [ -n "$REMAINING" ]; then
        echo "⚠️  El puerto $PORT sigue en uso. Ejecuta: kill -9 $REMAINING"
    fi
fi
