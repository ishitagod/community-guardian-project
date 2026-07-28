export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#4F46E5',
          light: '#EEF2FF',
          hover: '#4338CA',
        },
        verified: {
          DEFAULT: '#059669',
          light: '#ECFDF5',
          border: '#6EE7B7',
        },
        noise: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
          border: '#FECACA',
        },
        unreviewed: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
          border: '#FDE68A',
        },
        sidebar: '#0F172A',
      },
    },
  },
  plugins: [],
  safelist: ["hover:bg-white/8", "bg-white/8"],
}
