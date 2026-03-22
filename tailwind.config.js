/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./login.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-tertiary-container": "#ffceca",
        "on-primary-fixed-variant": "#00468c",
        "tertiary-fixed-dim": "#ffb3ac",
        "on-error": "#ffffff",
        "surface-tint": "#005db6",
        "tertiary-fixed": "#ffdad6",
        "outline-variant": "#c2c6d4",
        "inverse-primary": "#a9c7ff",
        "primary-fixed-dim": "#a9c7ff",
        "outline": "#727783",
        "on-primary-fixed": "#001b3d",
        "on-secondary": "#ffffff",
        "on-surface": "#191c1e",
        "surface-container-low": "#f2f4f6",
        "primary": "#00478d",
        "inverse-on-surface": "#eff1f3",
        "surface-container": "#eceef0",
        "surface": "#f8f9fc",
        "secondary-container": "#8ef69b",
        "error-container": "#ffdad6",
        "inverse-surface": "#2e3133",
        "background": "#f8f9fc",
        "on-tertiary-fixed": "#410003",
        "on-primary": "#ffffff",
        "tertiary-container": "#bb1b21",
        "on-secondary-fixed-variant": "#00531f",
        "on-primary-container": "#c8daff",
        "surface-variant": "#e1e2e5",
        "surface-container-high": "#e7e8eb",
        "on-tertiary-fixed-variant": "#930010",
        "primary-container": "#005eb8",
        "secondary-fixed-dim": "#75dc84",
        "surface-bright": "#f8f9fc",
        "surface-container-lowest": "#ffffff",
        "error": "#ba1a1a",
        "secondary-fixed": "#91f99e",
        "on-secondary-fixed": "#002108",
        "primary-fixed": "#d6e3ff",
        "on-tertiary": "#ffffff",
        "on-secondary-container": "#00722d",
        "surface-dim": "#d8dadd",
        "on-background": "#191c1e",
        "on-surface-variant": "#424752",
        "surface-container-highest": "#e1e2e5",
        "tertiary": "#940010",
        "secondary": "#006e2b",
        "on-error-container": "#93000a"
      },
      fontFamily: {
        headline: ["'Public Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        label: ["'Inter'", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem"
      }
    }
  },
  darkMode: "class",
  plugins: [require("@tailwindcss/forms")]
}
