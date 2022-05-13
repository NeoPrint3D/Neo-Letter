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
      minHeight: {
        page: "calc(100vh - 5rem)",
      },
      dropShadow: {
        '3xl': '0 35px 35px rgba(0, 0, 0, 0.25)',
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
