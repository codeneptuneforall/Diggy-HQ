export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FBF6EF', 2: '#F4ECE0', 3: '#EDE2D3' },
        ink: { DEFAULT: '#2A2226', 2: '#574C51', 3: '#74686D' },
        line: { DEFAULT: '#ECE2D7', strong: '#D9CBBD' },
        plum: { DEFAULT: '#2E1B2B', 2: '#3D2639', 3: '#55384F', text: '#E9DCE5', muted: '#B9A3B4' },
        berry: {
          50: '#FDF0F6',
          100: '#FADDEB',
          200: '#F4B6D2',
          400: '#E46CA8',
          500: '#D9468F',
          600: '#BF2F77',
          700: '#9C2260',
          800: '#781A4A',
        },
        ok: { 50: '#EEF7EF', 100: '#D5ECD8', 500: '#3F9A50', 600: '#2F7D3E', 700: '#25642F' },
        warn: { 50: '#FDF5E4', 100: '#F9E6BA', 500: '#D08A12', 600: '#A86A06', 700: '#8A5604' },
        bad: { 50: '#FCEDEC', 100: '#F7D3D0', 500: '#D9483D', 600: '#C0362C', 700: '#9D2A22' },
        info: { 50: '#EDF3FA', 100: '#D3E2F2', 500: '#3E73AE', 600: '#2F5F95', 700: '#244B77' },
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(42,34,38,0.05), 0 1px 1px rgba(42,34,38,0.03)',
        pop: '0 12px 32px -8px rgba(42,34,38,0.22), 0 2px 6px rgba(42,34,38,0.08)',
      },
    },
  },
};
