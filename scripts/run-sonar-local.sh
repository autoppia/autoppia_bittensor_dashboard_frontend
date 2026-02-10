#!/bin/bash

# Script para ejecutar análisis de SonarCloud en local
# Uso: 
#   ./scripts/run-sonar-local.sh          # Sube resultados a SonarCloud (por defecto)
#   ./scripts/run-sonar-local.sh --local # Solo analiza localmente, no sube
#   ./scripts/run-sonar-local.sh --upload # Explícitamente sube a SonarCloud

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detectar modo de ejecución
MODE="upload" # Por defecto sube a SonarCloud

if [ "$1" == "--local" ]; then
    MODE="local"
elif [ "$1" == "--upload" ]; then
    MODE="upload"
elif [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Uso: $0 [--local|--upload|--help]"
    echo ""
    echo "Modos:"
    echo "  (sin flag)  Sube resultados a SonarCloud (por defecto)"
    echo "  --local     Solo analiza localmente, NO sube a SonarCloud"
    echo "  --upload    Explícitamente sube resultados a SonarCloud"
    echo "  --help      Muestra esta ayuda"
    exit 0
elif [ -n "$1" ]; then
    echo -e "${RED}❌ Opción desconocida: $1${NC}"
    echo "   Usa --help para ver las opciones disponibles"
    exit 1
fi

if [ "$MODE" == "local" ]; then
    echo -e "${BLUE}🔍 SonarCloud Local Analysis (Modo Local - NO sube resultados)${NC}"
else
    echo -e "${GREEN}🔍 SonarCloud Local Analysis (Modo Upload - Sube resultados)${NC}"
fi
echo ""

# Verificar que el token esté configurado (solo necesario para modo upload)
SONAR_TOKEN="${SONAR_TOKEN:-77ebb52b5f3cfb99368c13f49e03791b53287bbb}"

if [ "$MODE" == "upload" ]; then
    if [ -z "$SONAR_TOKEN" ]; then
        echo -e "${RED}❌ Error: SONAR_TOKEN no está configurado${NC}"
        echo "   Configúralo con: export SONAR_TOKEN=tu-token"
        exit 1
    fi
    echo -e "${GREEN}✅ Token configurado${NC}"
else
    echo -e "${BLUE}ℹ️  Modo local: No se requiere token (no se subirán resultados)${NC}"
fi
echo ""

# Verificar/instalar SonarScanner
SONAR_SCANNER_HOME="${SONAR_SCANNER_HOME:-$HOME/.sonar-scanner}"
SONAR_SCANNER_VERSION="7.0.2.4839"
SONAR_SCANNER_DIR="$SONAR_SCANNER_HOME/sonar-scanner-$SONAR_SCANNER_VERSION-linux"

if [ ! -d "$SONAR_SCANNER_DIR" ]; then
    echo -e "${YELLOW}📦 SonarScanner no encontrado. Instalando...${NC}"
    
    mkdir -p "$SONAR_SCANNER_HOME"
    cd "$SONAR_SCANNER_HOME"
    
    SCANNER_FILE="sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-x64.zip"
    SCANNER_URL="https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/${SCANNER_FILE}"
    
    echo "   Descargando SonarScanner $SONAR_SCANNER_VERSION..."
    wget -q "$SCANNER_URL" || {
        echo -e "${RED}❌ Error al descargar SonarScanner${NC}"
        exit 1
    }
    
    echo "   Extrayendo..."
    unzip -q "$SCANNER_FILE"
    rm "$SCANNER_FILE"
    
    echo -e "${GREEN}✅ SonarScanner instalado en: $SONAR_SCANNER_DIR${NC}"
    echo ""
fi

# Volver al directorio del proyecto
cd "$PROJECT_ROOT"

# Configurar PATH
export PATH="$SONAR_SCANNER_DIR/bin:$PATH"

# Verificar que sonar-scanner funciona
if ! command -v sonar-scanner &> /dev/null; then
    echo -e "${RED}❌ Error: sonar-scanner no está en el PATH${NC}"
    echo "   Asegúrate de que $SONAR_SCANNER_DIR/bin está en tu PATH"
    exit 1
fi

echo -e "${GREEN}✅ SonarScanner encontrado${NC}"
echo "   Versión: $(sonar-scanner --version | head -1)"
echo ""

# Verificar que existe sonar-project.properties
if [ ! -f "sonar-project.properties" ]; then
    echo -e "${RED}❌ Error: sonar-project.properties no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuración encontrada${NC}"
echo ""

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
    pnpm install --frozen-lockfile
    echo ""
fi

# Construir el proyecto (necesario para el análisis)
echo -e "${YELLOW}🔨 Construyendo proyecto...${NC}"
pnpm build || {
    echo -e "${YELLOW}⚠️  El build falló, pero continuando con el análisis...${NC}"
}
echo ""

# Ejecutar análisis
if [ "$MODE" == "local" ]; then
    echo -e "${BLUE}🚀 Ejecutando análisis local (NO se subirán resultados)...${NC}"
    echo ""
    
    # Modo local: analiza sin subir a SonarCloud
    # Usamos preview mode que genera reporte local
    sonar-scanner \
        -Dsonar.analysis.mode=preview \
        -Dsonar.issuesReport.html.enable=true \
        -Dsonar.report.export.path=sonar-report.json
    
    EXIT_CODE=$?
    
    echo ""
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ Análisis local completado exitosamente${NC}"
        echo ""
        echo -e "${BLUE}📊 Resultados locales:${NC}"
        echo "   - Reporte HTML: $PROJECT_ROOT/.scannerwork/report-task.txt"
        echo "   - Reporte JSON: $PROJECT_ROOT/sonar-report.json"
        echo ""
        if [ -f "$PROJECT_ROOT/.scannerwork/report-task.txt" ]; then
            echo -e "${YELLOW}📄 Resumen del análisis:${NC}"
            cat "$PROJECT_ROOT/.scannerwork/report-task.txt" 2>/dev/null || echo "   (No se pudo leer el resumen)"
        fi
    else
        echo -e "${RED}❌ El análisis falló con código de salida: $EXIT_CODE${NC}"
        exit $EXIT_CODE
    fi
else
    echo -e "${GREEN}🚀 Ejecutando análisis y subiendo a SonarCloud...${NC}"
    echo ""
    
    export SONAR_TOKEN
    
    sonar-scanner \
        -Dsonar.host.url=https://sonarcloud.io \
        -Dsonar.login="$SONAR_TOKEN"
    
    EXIT_CODE=$?
    
    echo ""
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ Análisis completado y subido exitosamente${NC}"
        echo ""
        echo "📊 Ver resultados en SonarCloud:"
        echo "   https://sonarcloud.io/project/overview?id=autoppia_autoppia_bittensor_dashboard_frontend"
    else
        echo -e "${RED}❌ El análisis falló con código de salida: $EXIT_CODE${NC}"
        exit $EXIT_CODE
    fi
fi
