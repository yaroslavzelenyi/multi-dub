/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // Критично важливо для системи тем
  theme: {
    extend: {
      colors: {
        // Додаємо theme кольори для світлої та темної теми
        theme: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
      },
      textColor: {
        theme: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
      },
      borderColor: {
        theme: {
          primary: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
        },
      },
    },
  },
  plugins: [],
}
