# SonarCloud Local Analysis

Script para ejecutar análisis de SonarCloud en local y obtener los mismos resultados que en producción.

## Requisitos

- `pnpm` instalado
- `wget` o `curl` para descargar SonarScanner
- `unzip` para extraer SonarScanner
- Token de SonarCloud (ya configurado en el script)

## Uso

### Modo Upload (por defecto - sube a SonarCloud)

```bash
cd autoppia_bittensor_dashboard_frontend
./scripts/run-sonar-local.sh
# O explícitamente:
./scripts/run-sonar-local.sh --upload
```

**Qué hace:**
- Analiza el código localmente
- Sube los resultados a SonarCloud
- Actualiza el proyecto en la web

### Modo Local (analiza y genera reportes locales)

```bash
cd autoppia_bittensor_dashboard_frontend
./scripts/run-sonar-local.sh --local
```

**Qué hace:**
- Analiza el código
- **También sube resultados a SonarCloud** (SonarScanner requiere conexión para descargar reglas)
- Genera reportes locales adicionales (HTML y JSON)
- Útil para tener reportes locales además de los de SonarCloud

**Nota importante:** SonarScanner siempre necesita conectarse a SonarCloud para descargar las reglas de análisis. Por lo tanto, los resultados también se subirán a SonarCloud, pero obtendrás reportes locales adicionales.

### Ver ayuda

```bash
./scripts/run-sonar-local.sh --help
```

## Qué hace el script

1. ✅ Verifica el modo de ejecución (--local o --upload)
2. ✅ Verifica que el token de SonarCloud esté configurado (solo modo upload)
3. 📦 Descarga e instala SonarScanner si no está instalado
4. 📦 Instala dependencias del proyecto (si es necesario)
5. 🔨 Construye el proyecto
6. 🔍 Ejecuta el análisis:
   - **Modo upload**: Analiza y sube resultados a SonarCloud
   - **Modo local**: Solo analiza y genera reportes locales
7. 📊 Muestra los resultados (enlace web o archivos locales)

## Configuración del token

El token está hardcodeado en el script. Si necesitas cambiarlo:

1. Edita `scripts/run-sonar-local.sh`
2. Cambia la línea: `SONAR_TOKEN="${SONAR_TOKEN:-77ebb52b5f3cfb99368c13f49e03791b53287bbb}"`

O exporta la variable de entorno:

```bash
export SONAR_TOKEN=tu-token-aqui
./scripts/run-sonar-local.sh
```

## Ubicación de SonarScanner

Por defecto, SonarScanner se instala en:
```
~/.sonar-scanner/sonar-scanner-7.0.2.4839-linux/
```

Si quieres cambiarlo, exporta la variable:
```bash
export SONAR_SCANNER_HOME=/ruta/personalizada
```

## Resultados

### Modo Upload (--upload o por defecto)
Después de ejecutar, verás los resultados en:
https://sonarcloud.io/project/overview?id=autoppia_autoppia_bittensor_dashboard_frontend

### Modo Local (--local)
Los resultados se guardan localmente en:
- **Reporte HTML**: `.scannerwork/report-task.txt`
- **Reporte JSON**: `sonar-report.json` (en la raíz del proyecto)

Puedes revisar estos archivos para ver los problemas encontrados sin subir nada a SonarCloud.

## Troubleshooting

### Error: "sonar-scanner: command not found"
- El script debería instalar SonarScanner automáticamente
- Si falla, verifica que `wget` y `unzip` estén instalados

### Error: "SONAR_TOKEN no está configurado"
- El token está hardcodeado en el script
- Si aparece este error, verifica que el script tenga el token correcto

### Error: "sonar-project.properties no encontrado"
- Asegúrate de ejecutar el script desde el directorio raíz del proyecto
- O desde `autoppia_bittensor_dashboard_frontend/`

### El análisis tarda mucho
- Es normal, SonarCloud analiza todo el código
- Puede tardar varios minutos dependiendo del tamaño del proyecto
