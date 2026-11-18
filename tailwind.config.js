/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wr: {
          deep: '#080808',        // Preto profundo
          graphite: '#151515',    // Grafite
          graphite2: '#202020',   // Grafite secundário
          border: '#262626',      // Bordas discretas
          borderHover: '#383838', // Bordas em hover
          orange: '#FF8500',      // Laranja principal
          orangeDark: '#D96A00',  // Laranja escuro
          gold: '#E5A51B',        // Dourado
          muted: '#A5A5A5',       // Cinza secundário
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
