import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        ZekSky: "#0d2249ff",
        ZekSkyLight: "#0d2249ff",
        ZekPurple: "#a4a3d3ff",
        ZekPurpleLight: "#F1F0FF",
        ZekPurple2: "#4f0e63ff",
        ZekBlueLight: "#bfc5d6ff",
        ZekBlue: "#d8dadfff",
      },
    },
  },
  plugins: [],
};
export default config;