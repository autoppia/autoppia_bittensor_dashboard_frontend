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
      colors: {
        "primary-green": "#10B981",
        "primary-blue": "#145CC2",
        "primary-pink": "#CB587E",
        "primary-orange": "#FF7E5F",
        "primary-yellow": "#FDE047",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(to right, #FF7E5F, #FEB47B)",
        "gradient-secondary": "linear-gradient(to right, #CB587E, #145CC2)"
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 15s linear infinite',
      },
    },
  },
};

export default config;
