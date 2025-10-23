import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#01959F",   
        primaryLight: "#4DD0E1",
        primaryDark: "#006F73",
        secondary: "#FBC037",
        secondaryLight: "#FFECB3",
        secondaryDark: "#FA9810",
        background: "#F5F5F5",
        danger: "#E11428",
        success: "#43936C",
        successBorder: "#B8DBCA",
        primaryText: "#1E1F21",
        primaryBg: "#FFFFFF",
        secondaryText: "#404040",
      },
    },
  },
  plugins: [],
};

export default config;
