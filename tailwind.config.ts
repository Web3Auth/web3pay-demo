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
      },
      backgroundImage: {
        login: "url('/images/demo--login-bg.svg')",
      },
      animation: {
        "bounce-short": "bounce 1s linear 2",
        "spin-short": "spin 20s linear infinite",
        "spin-medium": "spin 5s linear infinite",
        move: "move 3s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
