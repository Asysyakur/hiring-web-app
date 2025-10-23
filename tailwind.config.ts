import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#01959F",   // Teal-ish blue
        secondary: "#FBC037", // Warm yellow
        danger: "#E11428",    // Alert red
        success: "#43936C",   // Calming green
      },
    },
  },
  plugins: [],
};

export default config;
