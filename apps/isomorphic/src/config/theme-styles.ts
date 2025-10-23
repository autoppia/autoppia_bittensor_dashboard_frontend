// ============================================================================
// GLOBAL THEME CONSTANTS - Extracted from Rounds page for consistency
// Used across Agents and other pages to maintain visual consistency
// ============================================================================

/**
 * Glass background styles - base glassmorphism design
 * Provides the core glass card appearance with backdrop blur and transparency
 */
export const GLASS_STYLES = {
  // Base glass card background
  base: "relative overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-2xl",
  
  // Accent color variations for different states
  active: "border-emerald-400/50 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/5 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.4)]",
  completed: "border-indigo-400/50 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-violet-500/5 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.4)]",
  pending: "border-amber-400/50 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-yellow-500/5 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.4)]",
  
  // Card type variations
  metric: "rounded-3xl p-8 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] hover:border-white/30",
  tall: "rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)]",
  
  // Animated effects
  pulseBackground: "absolute inset-0 rounded-3xl opacity-30 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse pointer-events-none",
  pulseBackgroundRounded2xl: "absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse pointer-events-none",
  shineEffect: "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
  shineEffectRounded2xl: "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
};

/**
 * Metric card gradient configurations
 * Consistent color schemes for stats/metric cards
 */
export const METRIC_CARD_GRADIENTS = {
  amber: {
    gradient: "from-amber-500/30 via-yellow-500/25 to-orange-500/30",
    bgGradient: "from-amber-500/20 via-yellow-500/15 to-orange-500/10",
    iconGradient: "from-amber-400 to-orange-500",
    borderColor: "border-amber-400/50",
    glowColor: "rgba(251,191,36,0.5)",
  },
  yellow: {
    gradient: "from-yellow-500/30 via-amber-500/25 to-yellow-600/30",
    bgGradient: "from-yellow-500/20 via-amber-500/15 to-yellow-600/10",
    iconGradient: "from-yellow-400 via-amber-500 to-yellow-600",
    borderColor: "border-yellow-400/50",
    glowColor: "rgba(250,204,21,0.5)",
  },
  emerald: {
    gradient: "from-emerald-500/30 via-teal-500/25 to-cyan-500/30",
    bgGradient: "from-emerald-500/20 via-teal-500/15 to-cyan-500/10",
    iconGradient: "from-emerald-400 to-teal-500",
    borderColor: "border-emerald-400/50",
    glowColor: "rgba(16,185,129,0.5)",
  },
  green: {
    gradient: "from-emerald-500/30 via-teal-500/25 to-green-500/30",
    bgGradient: "from-emerald-500/20 via-teal-500/15 to-green-500/10",
    iconGradient: "from-emerald-400 via-teal-500 to-green-600",
    borderColor: "border-emerald-400/50",
    glowColor: "rgba(16,185,129,0.5)",
  },
  blue: {
    gradient: "from-blue-500/30 via-indigo-500/25 to-sky-500/30",
    bgGradient: "from-blue-500/20 via-indigo-500/15 to-sky-500/10",
    iconGradient: "from-blue-400 to-indigo-500",
    borderColor: "border-blue-400/50",
    glowColor: "rgba(59,130,246,0.5)",
  },
  indigo: {
    gradient: "from-blue-500/30 via-indigo-500/25 to-blue-600/30",
    bgGradient: "from-blue-500/20 via-indigo-500/15 to-blue-600/10",
    iconGradient: "from-blue-400 via-indigo-500 to-blue-600",
    borderColor: "border-blue-400/50",
    glowColor: "rgba(59,130,246,0.5)",
  },
  violet: {
    gradient: "from-violet-500/30 via-purple-500/25 to-fuchsia-500/30",
    bgGradient: "from-violet-500/20 via-purple-500/15 to-fuchsia-500/10",
    iconGradient: "from-violet-400 to-fuchsia-500",
    borderColor: "border-violet-400/50",
    glowColor: "rgba(139,92,246,0.5)",
  },
  purple: {
    gradient: "from-purple-500/30 via-violet-500/25 to-purple-600/30",
    bgGradient: "from-purple-500/20 via-violet-500/15 to-purple-600/10",
    iconGradient: "from-purple-400 via-violet-500 to-purple-600",
    borderColor: "border-purple-400/50",
    glowColor: "rgba(168,85,247,0.5)",
  },
  orange: {
    gradient: "from-orange-500/30 via-rose-500/25 to-orange-600/30",
    bgGradient: "from-orange-500/20 via-rose-500/15 to-orange-600/10",
    iconGradient: "from-orange-400 via-rose-500 to-orange-600",
    borderColor: "border-orange-400/50",
    glowColor: "rgba(251,146,60,0.5)",
  },
  cyan: {
    gradient: "from-cyan-500/30 via-teal-500/25 to-cyan-600/30",
    bgGradient: "from-cyan-500/20 via-teal-500/15 to-cyan-600/10",
    iconGradient: "from-cyan-400 via-teal-500 to-cyan-600",
    borderColor: "border-cyan-400/50",
    glowColor: "rgba(6,182,212,0.5)",
  },
  sky: {
    gradient: "from-sky-500/30 via-blue-500/25 to-sky-600/30",
    bgGradient: "from-sky-500/20 via-blue-500/15 to-sky-600/10",
    iconGradient: "from-sky-400 via-blue-500 to-sky-600",
    borderColor: "border-sky-400/50",
    glowColor: "rgba(14,165,233,0.5)",
  },
};

/**
 * Primary color palette
 * Main brand colors used throughout the app
 */
export const PRIMARY_COLORS = {
  emerald: {
    light: "#10B981",
    default: "#059669",
    dark: "#047857",
  },
  indigo: {
    light: "#818CF8",
    default: "#6366F1",
    dark: "#4F46E5",
  },
  amber: {
    light: "#FBBF24",
    default: "#F59E0B",
    dark: "#D97706",
  },
  teal: {
    light: "#14B8A6",
    default: "#0D9488",
    dark: "#0F766E",
  },
};

/**
 * Text color utilities for white text with varying opacity
 * Ensures consistent text hierarchy across dark backgrounds
 */
export const TEXT_STYLES = {
  white: "text-white",
  white95: "text-white/95",
  white90: "text-white/90",
  white80: "text-white/80",
  white70: "text-white/70",
  white60: "text-white/60",
  white50: "text-white/50",
  white40: "text-white/40",
};

/**
 * Helper function to create glow effect style object
 * Used for animated glow on hover
 */
export function createGlowEffect(glowColor: string) {
  return {
    maskImage: 'radial-gradient(white, transparent)',
    WebkitMaskImage: 'radial-gradient(white, transparent)',
    background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
  };
}

/**
 * Helper function to create shine effect style object
 * Used for subtle shine on hover
 */
export function createShineEffect() {
  return {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
  };
}

/**
 * Chip/Badge styles (for status indicators, tags, etc.)
 */
export const CHIP_STYLES = {
  base: "inline-flex items-center gap-2.5 rounded-full border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg transition-all duration-300",
  active: "border-emerald-400/70 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_30px_rgba(16,185,129,0.6)] hover:scale-105",
  completed: "border-indigo-400/70 bg-gradient-to-r from-indigo-500/90 to-purple-500/90 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_30px_rgba(99,102,241,0.6)] hover:scale-105",
  pending: "border-amber-400/70 bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_6px_30px_rgba(245,158,11,0.6)] hover:scale-105",
};

/**
 * Button styles
 */
export const BUTTON_STYLES = {
  navButton: "inline-flex items-center gap-2.5 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all duration-300 border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/20 hover:shadow-lg hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/40 disabled:hover:scale-100 backdrop-blur-sm",
};

/**
 * Section header style
 */
export const SECTION_HEADER = "rounded-2xl border-white/30 px-8 py-4 text-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center gap-4 hover:border-white/40 transition-all duration-300";

/**
 * List row styles
 */
export const LIST_ROW_STYLES = {
  hover: "hover:bg-white/15 hover:shadow-lg hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
};

/**
 * Skeleton/Loading styles
 */
export const SKELETON_CARD = "rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm animate-pulse";

