#!/bin/bash

# Script para ejecutar análisis de SonarCloud y mostrar reportes locales
# Uso: ./scripts/run-sonar-local.sh
#
# ⚠️  ADVERTENCIA: Este script ACTUALIZA SonarCloud con tus resultados locales.
#                  Para solo ver incidencias sin actualizar: npm run sonar:issues

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

echo -e "${GREEN}🔍 SonarCloud Analysis${NC}"
echo ""

# Advertencia antes de ejecutar
echo -e "${YELLOW}⚠️  ═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️   ADVERTENCIA: Este script ACTUALIZARÁ SonarCloud${NC}"
echo -e "${YELLOW}⚠️   con los resultados de tu código LOCAL.${NC}"
echo -e "${YELLOW}⚠️  ═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Esto significa que:${NC}"
echo "   • SonarCloud se actualizará con TUS cambios locales"
echo "   • Otros desarrolladores verán TUS resultados"
echo ""
echo -e "${BLUE}💡 Recomendación:${NC}"
echo "   • Para ver incidencias SIN actualizar: ${GREEN}npm run sonar:issues${NC}"
echo ""
read -p "¿Quieres continuar y actualizar SonarCloud? (s/N): " -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo -e "${GREEN}✅ Cancelado. Usa 'npm run sonar:issues' para ver incidencias sin actualizar.${NC}"
  exit 0
fi

# Verificar que el token esté configurado
SONAR_TOKEN="${SONAR_TOKEN:-49f59036fae21b71aae4c0e7f32aa68120fbbcb8}"

if [ -z "$SONAR_TOKEN" ]; then
    echo -e "${RED}❌ Error: SONAR_TOKEN no está configurado${NC}"
    echo "   Configúralo con: export SONAR_TOKEN=tu-token"
    exit 1
fi

echo -e "${GREEN}✅ Token configurado${NC}"
echo ""

# Verificar/instalar SonarScanner
SONAR_SCANNER_HOME="${SONAR_SCANNER_HOME:-$HOME/.sonar-scanner}"
SONAR_SCANNER_VERSION="7.0.2.4839"
SONAR_SCANNER_DIR="$SONAR_SCANNER_HOME/sonar-scanner-$SONAR_SCANNER_VERSION-linux-x64"

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
    unzip -q -o "$SCANNER_FILE" || {
        echo -e "${RED}❌ Error al extraer SonarScanner${NC}"
        exit 1
    }

    # El zip extrae a "sonar-scanner-X.X.X-linux-x64", renombrar si es necesario
    EXTRACTED_DIR="sonar-scanner-${SONAR_SCANNER_VERSION}-linux-x64"
    if [ -d "$EXTRACTED_DIR" ] && [ "$EXTRACTED_DIR" != "$SONAR_SCANNER_DIR" ]; then
        mv "$EXTRACTED_DIR" "$SONAR_SCANNER_DIR" 2>/dev/null || true
    fi

    rm -f "$SCANNER_FILE"

    echo -e "${GREEN}✅ SonarScanner instalado en: $SONAR_SCANNER_DIR${NC}"
    echo ""
fi

# Volver al directorio del proyecto
cd "$PROJECT_ROOT"

# Configurar PATH (poner nuestro scanner primero para evitar conflictos)
export PATH="$SONAR_SCANNER_DIR/bin:$PATH"

# Verificar que sonar-scanner funciona (usar la ruta completa para evitar conflictos)
SONAR_SCANNER_CMD="$SONAR_SCANNER_DIR/bin/sonar-scanner"

if [ ! -f "$SONAR_SCANNER_CMD" ]; then
    echo -e "${RED}❌ Error: sonar-scanner no encontrado en $SONAR_SCANNER_CMD${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SonarScanner encontrado${NC}"
echo "   Versión: $($SONAR_SCANNER_CMD --version 2>&1 | grep -i "SonarScanner" | head -1 || echo "SonarScanner CLI $SONAR_SCANNER_VERSION")"
echo "   Ubicación: $SONAR_SCANNER_CMD"
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
echo -e "${GREEN}🚀 Ejecutando análisis y subiendo a SonarCloud...${NC}"
echo ""

export SONAR_TOKEN

$SONAR_SCANNER_CMD \
    -Dsonar.host.url=https://sonarcloud.io \
    -Dsonar.token="$SONAR_TOKEN" \
    -Dsonar.issuesReport.html.enable=true \
    -Dsonar.issuesReport.console.enable=true

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Análisis completado y subido exitosamente${NC}"
    echo ""

    # Mostrar reportes locales
    echo -e "${BLUE}📊 Reportes locales generados:${NC}"
    if [ -f "$PROJECT_ROOT/.scannerwork/report-task.txt" ]; then
        echo "   - Reporte: $PROJECT_ROOT/.scannerwork/report-task.txt"
        echo ""
        echo -e "${YELLOW}📄 Resumen del análisis:${NC}"
        cat "$PROJECT_ROOT/.scannerwork/report-task.txt" 2>/dev/null || echo "   (No se pudo leer el resumen)"
        echo ""
    fi

    echo -e "${BLUE}🔗 Ver resultados en SonarCloud:${NC}"
    echo "   https://sonarcloud.io/dashboard?id=autoppia_autoppia_bittensor_dashboard_frontend"
    echo ""

    # Mostrar incidencias usando el script get-sonar-issues
    if [ -f "$SCRIPT_DIR/get-sonar-issues.sh" ]; then
        echo -e "${BLUE}📋 Obteniendo incidencias actualizadas...${NC}"
        echo ""
        sleep 3  # Esperar a que SonarCloud procese
        "$SCRIPT_DIR/get-sonar-issues.sh"
    fi
else
    echo -e "${RED}❌ El análisis falló con código de salida: $EXIT_CODE${NC}"
    exit $EXIT_CODE
fi
