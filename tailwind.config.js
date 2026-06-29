/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lumia: {
          bg: '#1a1a1a',
          surface: '#2a2a2a',
          accent: '#333333',
          text: '#e0e0e0',
          muted: '#888888',
          blue: '#4a90d9',
          green: '#4caf50',
          red: '#e53935',
          orange: '#ff9800',
        }
      },
      fontFamily: {
        lumia: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
