#!/usr/bin/env bash
set -euo pipefail

# Script para obtener y mostrar las incidencias de SonarCloud
# Uso: ./scripts/get-sonar-issues.sh

PROJECT_KEY="autoppia_autoppia_bittensor_dashboard_frontend"
HOST_URL="https://sonarcloud.io"
TOKEN="${SONAR_TOKEN:-77ebb52b5f3cfb99368c13f49e03791b53287bbb}"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
ORANGE='\033[0;33m'
NC='\033[0m'

# Función para convertir rating numérico a letra
rating_to_letter() {
  case "$1" in
    1.0|1) echo "A" ;;
    2.0|2) echo "B" ;;
    3.0|3) echo "C" ;;
    4.0|4) echo "D" ;;
    5.0|5) echo "E" ;;
    A|B|C|D|E) echo "$1" ;;
    *) echo "A" ;;
  esac
}

# Función para obtener rating con color
get_rating_color() {
  local rating=$(rating_to_letter "$1")
  case "${rating}" in
    A) echo -e "${GREEN}A${NC}" ;;
    B) echo -e "${GREEN}B${NC}" ;;
    C) echo -e "${YELLOW}C${NC}" ;;
    D) echo -e "${ORANGE}D${NC}" ;;
    E) echo -e "${RED}E${NC}" ;;
    *) echo "$1" ;;
  esac
}

echo -e "${BLUE}📊 Obteniendo información del Quality Gate de SonarCloud...${NC}"
echo ""

# Verificar si jq está disponible
if command -v jq >/dev/null 2>&1; then
  USE_JQ=true
else
  USE_JQ=false
  echo -e "${YELLOW}⚠ jq no está instalado. Instálalo para mejor parsing: sudo apt install jq${NC}"
  echo ""
fi

# Obtener Quality Gate Status
QG_RESPONSE=$(curl -s -u "${TOKEN}:" \
  "${HOST_URL}/api/qualitygates/project_status?projectKey=${PROJECT_KEY}" \
  2>/dev/null || echo "")

# Obtener métricas completas
METRICS_RESPONSE=$(curl -s -u "${TOKEN}:" \
  "${HOST_URL}/api/measures/component?component=${PROJECT_KEY}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,security_rating,reliability_rating,sqale_rating,security_review_rating,security_hotspots,uncovered_lines,lines_to_cover,accepted_issues" \
  2>/dev/null || echo "")

# Obtener incidencias por severidad
ISSUES_RESPONSE=$(curl -s -u "${TOKEN}:" \
  "${HOST_URL}/api/issues/search?componentKeys=${PROJECT_KEY}&resolved=false&ps=100&facets=severities,types" \
  2>/dev/null || echo "")

# Obtener Security Hotspots
HOTSPOTS_RESPONSE=$(curl -s -u "${TOKEN}:" \
  "${HOST_URL}/api/hotspots/search?projectKey=${PROJECT_KEY}&status=TO_REVIEW" \
  2>/dev/null || echo "")

if [[ -z "${METRICS_RESPONSE}" ]] || echo "${METRICS_RESPONSE}" | grep -q "error"; then
  echo -e "${RED}✗ Error al conectar con SonarCloud${NC}"
  exit 1
fi

# Verificar si hay métricas disponibles
HAS_METRICS=false
if [[ "${USE_JQ}" == "true" ]]; then
  MEASURES_COUNT=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures | length' 2>/dev/null || echo "0")
  if [[ "${MEASURES_COUNT}" -gt 0 ]]; then
    HAS_METRICS=true
  fi
else
  if echo "${METRICS_RESPONSE}" | grep -q '"measures":\[.*\]' && ! echo "${METRICS_RESPONSE}" | grep -q '"measures":\[\]'; then
    HAS_METRICS=true
  fi
fi

# Parsear métricas
if [[ "${USE_JQ}" == "true" ]]; then
  if [[ "${HAS_METRICS}" == "true" ]]; then
    BUGS=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="bugs") | .value // "0"' 2>/dev/null || echo "0")
    VULNERABILITIES=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="vulnerabilities") | .value // "0"' 2>/dev/null || echo "0")
    CODE_SMELLS=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="code_smells") | .value // "0"' 2>/dev/null || echo "0")
    COVERAGE=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="coverage") | .value // "0"' 2>/dev/null || echo "0")
    DUPLICATED=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="duplicated_lines_density") | .value // "0"' 2>/dev/null || echo "0")
    SECURITY_RATING_RAW=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="security_rating") | .value // "1.0"' 2>/dev/null || echo "1.0")
    RELIABILITY_RATING_RAW=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="reliability_rating") | .value // "1.0"' 2>/dev/null || echo "1.0")
    MAINTAINABILITY_RATING_RAW=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="sqale_rating") | .value // "1.0"' 2>/dev/null || echo "1.0")
    SECURITY_REVIEW_RATING_RAW=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="security_review_rating") | .value // "1.0"' 2>/dev/null || echo "1.0")

    SECURITY_RATING=$(rating_to_letter "${SECURITY_RATING_RAW}")
    RELIABILITY_RATING=$(rating_to_letter "${RELIABILITY_RATING_RAW}")
    MAINTAINABILITY_RATING=$(rating_to_letter "${MAINTAINABILITY_RATING_RAW}")
    SECURITY_REVIEW_RATING=$(rating_to_letter "${SECURITY_REVIEW_RATING_RAW}")
    SECURITY_HOTSPOTS=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="security_hotspots") | .value // "0"' 2>/dev/null || echo "0")
    ACCEPTED_ISSUES=$(echo "${METRICS_RESPONSE}" | jq -r '.component.measures[]? | select(.metric=="accepted_issues") | .value // "0"' 2>/dev/null || echo "0")
  else
    # No hay métricas aún
    BUGS="0"
    VULNERABILITIES="0"
    CODE_SMELLS="0"
    COVERAGE="0"
    DUPLICATED="0"
    SECURITY_RATING="A"
    RELIABILITY_RATING="A"
    MAINTAINABILITY_RATING="A"
    SECURITY_REVIEW_RATING="A"
    SECURITY_HOTSPOTS="0"
    ACCEPTED_ISSUES="0"
  fi

  # Quality Gate
  QG_STATUS=$(echo "${QG_RESPONSE}" | jq -r '.projectStatus.status // "UNKNOWN"' 2>/dev/null || echo "UNKNOWN")

  # Issues por severidad
  BLOCKER_COUNT=$(echo "${ISSUES_RESPONSE}" | jq -r '[.issues[] | select(.severity=="BLOCKER")] | length' 2>/dev/null || echo "0")
  CRITICAL_COUNT=$(echo "${ISSUES_RESPONSE}" | jq -r '[.issues[] | select(.severity=="CRITICAL")] | length' 2>/dev/null || echo "0")
  MAJOR_COUNT=$(echo "${ISSUES_RESPONSE}" | jq -r '[.issues[] | select(.severity=="MAJOR")] | length' 2>/dev/null || echo "0")
  MINOR_COUNT=$(echo "${ISSUES_RESPONSE}" | jq -r '[.issues[] | select(.severity=="MINOR")] | length' 2>/dev/null || echo "0")
  INFO_COUNT=$(echo "${ISSUES_RESPONSE}" | jq -r '[.issues[] | select(.severity=="INFO")] | length' 2>/dev/null || echo "0")
else
  # Fallback sin jq
  BUGS="0"
  VULNERABILITIES="0"
  CODE_SMELLS="0"
  COVERAGE="0"
  DUPLICATED="0"
  SECURITY_RATING="A"
  RELIABILITY_RATING="A"
  MAINTAINABILITY_RATING="A"
  SECURITY_REVIEW_RATING="A"
  SECURITY_HOTSPOTS="0"
  ACCEPTED_ISSUES="0"
  QG_STATUS="UNKNOWN"
  BLOCKER_COUNT="0"
  CRITICAL_COUNT="0"
  MAJOR_COUNT="0"
  MINOR_COUNT="0"
  INFO_COUNT="0"
fi

# Calcular High = CRITICAL + BLOCKER, Medium = MAJOR, Low = MINOR + INFO
HIGH_COUNT=$((CRITICAL_COUNT + BLOCKER_COUNT))
MEDIUM_COUNT=${MAJOR_COUNT}
LOW_COUNT=$((MINOR_COUNT + INFO_COUNT))

# Mostrar Quality Gate Status
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
if [[ "${QG_STATUS}" == "OK" ]]; then
  echo -e "${GREEN}  ✓ Quality Gate: PASSED${NC}"
elif [[ "${QG_STATUS}" == "UNKNOWN" ]] || [[ "${HAS_METRICS}" == "false" ]]; then
  echo -e "${YELLOW}  ⚠ Quality Gate: NO DISPONIBLE${NC}"
  echo -e "${YELLOW}     (El proyecto aún no ha sido analizado)${NC}"
else
  echo -e "${RED}  ✗ Quality Gate: FAILED${NC}"
fi
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Mostrar métricas principales
if [[ "${HAS_METRICS}" == "false" ]]; then
  echo -e "${YELLOW}⚠️  El proyecto aún no tiene métricas disponibles${NC}"
  echo -e "${YELLOW}   Ejecuta 'npm run sonar' para realizar el primer análisis${NC}"
  echo ""
else
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  MÉTRICAS DE CALIDAD${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo ""

  echo -e "  ${CYAN}Security:${NC}        ${BUGS} Bugs, Rating: $(get_rating_color ${SECURITY_RATING})"
  echo -e "  ${CYAN}Reliability:${NC}     ${VULNERABILITIES} Vulnerabilities, Rating: $(get_rating_color ${RELIABILITY_RATING})"
  echo -e "  ${CYAN}Maintainability:${NC} ${CODE_SMELLS} Code Smells, Rating: $(get_rating_color ${MAINTAINABILITY_RATING})"
  echo ""

  if [[ "${COVERAGE}" != "0" ]] && [[ -n "${COVERAGE}" ]]; then
    echo -e "  ${CYAN}Coverage:${NC} ${COVERAGE}%"
  else
    echo -e "  ${CYAN}Coverage:${NC} No disponible"
  fi

  if [[ "${DUPLICATED}" != "0" ]] && [[ -n "${DUPLICATED}" ]]; then
    echo -e "  ${CYAN}Duplications:${NC} ${DUPLICATED}%"
  else
    echo -e "  ${CYAN}Duplications:${NC} No disponible"
  fi

  echo -e "  ${CYAN}Security Hotspots:${NC} ${SECURITY_HOTSPOTS}, Rating: $(get_rating_color ${SECURITY_REVIEW_RATING})"
  echo ""
fi

# Incidencias por severidad
echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
echo -e "${RED}  INCIDENCIAS POR SEVERIDAD${NC}"
echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "  ${RED}🚫 Blocker:${NC}   ${BLOCKER_COUNT}"
echo -e "  ${RED}⚠️  Critical:${NC}  ${CRITICAL_COUNT}"
echo -e "  ${YELLOW}🔸 Major:${NC}     ${MEDIUM_COUNT}"
echo -e "  ${YELLOW}🔹 Minor:${NC}     ${LOW_COUNT}"
echo ""

# Mostrar archivos con problemas (si tenemos jq y hay incidencias)
if [[ "${USE_JQ}" == "true" ]] && [[ -n "${ISSUES_RESPONSE}" ]]; then
  TOTAL_ISSUES=$(echo "${ISSUES_RESPONSE}" | jq -r '.total // 0' 2>/dev/null || echo "0")

  if [[ ${TOTAL_ISSUES} -gt 0 ]]; then
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  ARCHIVOS CON PROBLEMAS (Top 20)${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""

    echo "${ISSUES_RESPONSE}" | jq -r '.issues[0:20] | group_by(.component) | .[] |
      "📁 " + .[0].component + "\n" +
      (.[] |
        if .severity == "BLOCKER" then "  🔴 Línea \(.line // "?")"
        elif .severity == "CRITICAL" then "  🔴 Línea \(.line // "?")"
        elif .severity == "MAJOR" then "  🟠 Línea \(.line // "?")"
        elif .severity == "MINOR" then "  🟡 Línea \(.line // "?")"
        else "  🔵 Línea \(.line // "?")"
        end +
        ": \(.message)\n" +
        "     Tipo: \(.type) | Regla: \(.rule)\n"
      ) + "\n"
    ' 2>/dev/null | head -100 || true

    if [[ ${TOTAL_ISSUES} -gt 20 ]]; then
      echo -e "${YELLOW}... y $((TOTAL_ISSUES - 20)) más. Ver todas en SonarCloud web.${NC}"
      echo ""
    fi
  fi
fi

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔗 Enlaces útiles:${NC}"
echo -e "  • Dashboard: ${HOST_URL}/dashboard?id=${PROJECT_KEY}"
echo -e "  • Todas las incidencias: ${HOST_URL}/project/issues?id=${PROJECT_KEY}&resolved=false"
echo -e "  • Solo críticas: ${HOST_URL}/project/issues?id=${PROJECT_KEY}&severities=CRITICAL,BLOCKER&resolved=false"
echo -e "  • Security Hotspots: ${HOST_URL}/security_hotspots?id=${PROJECT_KEY}"
echo ""
