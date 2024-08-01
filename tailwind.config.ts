import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        "max-height": "max-height",
        transform: "transform",
      },
      maxHeight: {
        "0": "0",
        screen: "100vh",
      },
      colors: {
        primary: "#030324",
        opaque: "#182146",
        line: "rgba(255, 255, 255, 0.30)",
        gradient: {
          one: "#18F6DB",
          two: "#0364FF",
          three: "#66D4F6",
          four: "#4D92FF",
          five: "#BB65FF",
        },
        darkCard: "rgba(0, 0, 0, 0.50)",
        modal: "rgba(118, 118, 118, 0.30)",
        navDropdown: "#1a2043",
      },
      backgroundImage: {
        login: "url('/images/demo-login-bg.svg')",
        home: "url('/images/demo-home-bg.svg')",
        crossChain: "url('/images/cross-chain-gradient.png')",
      },
      animation: {
        "bounce-short": "bounce 1s linear 2",
        "spin-short": "spin 20s linear infinite",
        "spin-medium": "spin 5s linear infinite",
        move: "move 3s ease-in-out",
        fadeIn: "fadeIn 0.3s ease-out forwards",
        fadeOut: "fadeOut 0.3s ease-out forwards",
        scaleIn: "scaleIn 0.3s ease-out forwards",
        scaleOut: "scaleOut 0.3s ease-out forwards",
        spin: "spin 1s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.75)" },
          "100%": { transform: "scale(1)" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.75)" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
