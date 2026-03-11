/* src/utils/website-colors.ts */

import { websitesData } from "@/data/websites-data";

/**
 * Mapeo de puertos localhost a nombres de proyectos
 * Centralizado para usar en toda la aplicación
 */
export const LOCALHOST_PORT_MAPPING: { [key: string]: string } = {
  "8000": "AutoCinema",
  "8001": "AutoBooks",
  "8002": "Autozone",
  "8003": "AutoDining",
  "8004": "AutoCRM",
  "8005": "AutoMail",
  "8006": "AutoDelivery",
  "8007": "AutoLodge",
  "8008": "AutoConnect",
  "8009": "AutoWork",
  "8010": "AutoCalendar",
  "8011": "AutoList",
  "8012": "AutoDrive",
  "8013": "AutoHealth",
  "8014": "AutoFinance",
};

/**
 * Obtiene el nombre del proyecto desde una URL localhost
 */
export function formatWebsiteName(name?: string | null): string {
  if (!name) return "Website";
  if (name.length === 0) return name;

  const portMatch = /localhost:(\d+)/.exec(name);
  if (portMatch) {
    const port = portMatch[1];
    return LOCALHOST_PORT_MAPPING[port] || `Web Project (${port})`;
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
}

export interface ProjectColors {
  dotColor: string;
  // Color hex principal
  mainColor: string;
}

/**
 * Mapeo de colores hex a colores de Tailwind aproximados
 * para generar clases de Tailwind
 */
function hexToTailwindColor(hex: string): string {
  const colorMap: { [key: string]: string } = {
    "#9333EA": "purple-600", // AutoCinema
    "#10B981": "emerald-500", // AutoBooks
    "#EF4444": "red-500", // Autozone
    "#F59E0B": "amber-500", // AutoDining
    "#3B82F6": "blue-500", // AutoCRM
    "#8B5CF6": "violet-500", // AutoMail
    "#EC4899": "pink-500", // AutoDelivery
    "#06B6D4": "cyan-500", // AutoLodge
    "#0EA5E9": "sky-500", // AutoConnect
    "#14B8A6": "teal-500", // AutoWork
    "#A855F7": "purple-500", // AutoCalendar
    "#F97316": "orange-500", // AutoList
  };
  return colorMap[hex.toUpperCase()] || "slate-500";
}

/**
 * Obtiene los colores de un proyecto desde la fuente centralizada (websites-data.ts)
 * ESTA ES LA FUNCIÓN PRINCIPAL QUE DEBES USAR EN TODA LA APLICACIÓN
 *
 * Retorna el color hex principal y el color dotColor
 */
export function getProjectColors(projectName: string): ProjectColors {
  if (!projectName) {
    return {
      dotColor: "#64748b",
      mainColor: "#64748b",
    };
  }

  // Normalizar el nombre del proyecto (trim y lowercase)
  const normalizedName = projectName.trim().toLowerCase();

  // Primero, intentar buscar directamente por nombre o slug
  let website = websitesData.find(
    (w) => {
      const nameMatch = w.name.toLowerCase() === normalizedName;
      const slugMatch = w.slug?.toLowerCase() === normalizedName;
      return nameMatch || slugMatch;
    }
  );

  // Si no se encuentra, intentar buscar por el nombre formateado
  if (!website) {
    const formattedName = formatWebsiteName(projectName);
    if (formattedName !== projectName && formattedName.toLowerCase() !== normalizedName) {
      website = websitesData.find(
        (w) => {
          const nameMatch = w.name.toLowerCase() === formattedName.toLowerCase();
          const slugMatch = w.slug?.toLowerCase() === formattedName.toLowerCase();
          return nameMatch || slugMatch;
        }
      );
    }
  }

  // Si aún no se encuentra, buscar por coincidencia parcial (para casos como "autocinema" vs "AutoCinema")
  website ??= websitesData.find(
    (w) => {
      const nameLower = w.name.toLowerCase();
      const slugLower = w.slug?.toLowerCase() ?? "";
      // Buscar si el nombre normalizado contiene el slug o viceversa
      return nameLower.includes(normalizedName) ||
             normalizedName.includes(nameLower) ||
             slugLower.includes(normalizedName) ||
             normalizedName.includes(slugLower);
    }
  );

  if (website?.color) {
    return {
      dotColor: website.color,
      mainColor: website.color,
    };
  }

  // Default para proyectos no encontrados (gris)
  return {
    dotColor: "#64748b",
    mainColor: "#64748b",
  };
}

/**
 * Obtiene solo el color principal del proyecto
 */
export function getProjectMainColor(projectName: string): string {
  const website = websitesData.find(
    (w) => w.name.toLowerCase() === projectName.toLowerCase()
  );
  return website?.color || "#64748b";
}

/**
 * Obtiene información completa del proyecto por nombre
 */
export function getProjectInfo(projectName: string) {
  return websitesData.find(
    (w) => w.name.toLowerCase() === projectName.toLowerCase()
  );
}

/**
 * Obtiene información completa del proyecto por puerto
 */
export function getProjectInfoByPort(port: string) {
  return websitesData.find((w) => w.portValidator === port);
}
