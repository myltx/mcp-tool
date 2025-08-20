// tailwind.config.js - Tailwind v4 配置
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1d4ed8", 500: "#1d4ed8", 600: "#2563eb" },
      },
      borderRadius: { lg: "0.5rem" },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)",
      },
    },
  },
  plugins: [],
};
