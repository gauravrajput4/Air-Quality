/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#DBEAFE',
          ring: '#93C5FD',
        },
        ink: {
          DEFAULT: '#111827',
          muted: '#4B5563',
          soft: '#6B7280',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F9FAFB',
          muted: '#F3F4F6',
          border: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 12px 36px rgba(17, 24, 39, 0.08)',
        glow: '0 0 0 1px rgba(37, 99, 235, 0.12), 0 20px 45px rgba(37, 99, 235, 0.08)',
      },
    },
  },
  plugins: [],
};
