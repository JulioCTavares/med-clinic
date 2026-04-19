/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  // Disable preflight to avoid conflicts with Quasar's reset
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        brand: {
          DEFAULT: '#1976D2',
          light: '#42A5F5',
          dark: '#0D47A1',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}
