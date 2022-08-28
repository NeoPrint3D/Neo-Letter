/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#ef233c",
        "primary-dark": "#023047",
        "success": "#22c55e",
        "warning": "#FBBD23",
      },
      fontFamily: {
        logo: ["Crete Round", "serif"],
      },
      height: {
        page: "calc(100vh - 5rem)",
      },
      minHeight: {
        page: "calc(100vh - 5rem)",
      },
      boxShadow: {
        "input": "rgba(0, 0, 0, 0.04) 0px 1px 1px, rgba(0, 0, 0, 0.04) 0px 2px 2px, rgba(0, 0, 0, 0.04) 0px 4px 4px, rgba(0, 0, 0, 0.04) 0px 8px 8px,rgba(0, 0, 0, 0.04) 0px 16px 16px",
        "input-inner": " box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px - 18px inset"
      }


    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  },
  plugins: [require("daisyui")],

  daisyui: {
    logs: false,
    themes: [
      {
        mytheme: {
          "primary": "#ef233c",
          "secondary": "#f3f4f6",
          "accent": "#eab308",
          "neutral": "#191D24",
          "base-100": "#2A303C",
          "info": "#1d4ed8",
          "success": "#22c55e",
          "warning": "#FBBD23",
          "error": "#dc2626",
        },
      },
    ],
  },
}
