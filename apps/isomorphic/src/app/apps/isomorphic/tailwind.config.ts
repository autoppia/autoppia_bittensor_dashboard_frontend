import type { Config } from "tailwindcss";
import sharedConfig from "tailwind-config";

const config: Pick<Config, "prefix" | "presets" | "content" | "theme"> = {
  content: [
    "./src/**/*.tsx",
    "./node_modules/rizzui/dist/*.{js,ts,jsx,tsx}",
    '../../packages/isomorphic-core/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [sharedConfig],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-primary": "linear-gradient(to right, #FF7E5F, #FEB47B)",
        "gradient-secondary": "linear-gradient(to right, #CB587E, #145CC2)"
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(var(--container-width, 300px))' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee var(--marquee-cycle, 10s) linear infinite',
      },
    },
  },
};

export default config;
