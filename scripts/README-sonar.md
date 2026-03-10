# SonarCloud Local Analysis

Scripts para ejecutar análisis de SonarCloud en local y ver incidencias en el IDE (rama `fix/sonar` o la que tengas activa).

## Requisitos

- `pnpm` instalado
- `wget` y `unzip` para descargar SonarScanner (si no está instalado)
- **SONAR_TOKEN**: token de SonarCloud (obligatorio). Crear en [SonarCloud → Account → Security → Generate Tokens](https://sonarcloud.io/account/security). No hay valor por defecto por seguridad.

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

## Ver errores en el IDE

1. **SonarLint**: Con la extensión SonarLint instalada y el proyecto vinculado a SonarCloud (`.vscode/settings.json` → `sonarlint.connectedMode.project`), los issues se muestran en el editor y en la pestaña **Problems**. SonarLint usa la rama actual de git (p. ej. `fix/sonar`); asegúrate de que esa rama tenga al menos un análisis en SonarCloud (push o `npm run sonar`).
2. **Solo consultar sin subir**: `npm run sonar:issues` (requiere `SONAR_TOKEN` y `jq` opcional). Lista métricas e incidencias por consola.

## Configuración del token

El token es obligatorio y no tiene valor por defecto. Exporta la variable antes de ejecutar:

```bash
export SONAR_TOKEN=tu-token-aqui
./scripts/run-sonar-local.sh
# o para solo ver issues:
npm run sonar:issues
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
- Exporta el token: `export SONAR_TOKEN=tu_token` (crear en SonarCloud → Account → Security)

### Error: "sonar-project.properties no encontrado"
- Asegúrate de ejecutar el script desde el directorio raíz del proyecto
- O desde `autoppia_bittensor_dashboard_frontend/`

### El análisis tarda mucho
- Es normal, SonarCloud analiza todo el código
- Puede tardar varios minutos dependiendo del tamaño del proyecto
